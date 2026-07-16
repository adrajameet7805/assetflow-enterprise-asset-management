import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"

// Note: A true robust system would use a cron job or scheduled task to update booking statuses in the DB.
// For hackathon scope, we compute UPCOMING/ONGOING/COMPLETED dynamically on read.
export function computeBookingStatus(booking: { startTime: Date, endTime: Date, status: BookingStatus }): BookingStatus {
  if (booking.status === "CANCELLED") return "CANCELLED"
  
  const now = new Date()
  if (now < booking.startTime) return "UPCOMING"
  if (now >= booking.startTime && now <= booking.endTime) return "ONGOING"
  return "COMPLETED"
}
export class BookingOverlapError extends Error {
  constructor() {
    super("This asset is already booked for the requested time period.")
    this.name = "BookingOverlapError"
  }
}

export async function bookAsset(
  assetId: string,
  userId: string,
  startTime: Date,
  endTime: Date
) {
  if (startTime >= endTime) {
    throw new Error("End time must be after start time.")
  }

  return prisma.$transaction(async (tx) => {
    // 1. Lock the Asset row to prevent concurrent booking attempts on the same asset.
    // PostgreSQL row-level lock. We use queryRawUnsafe since assetId is a string.
    await tx.$executeRawUnsafe(`SELECT 1 FROM "Asset" WHERE id = $1 FOR UPDATE`, assetId)

    // 2. Check for overlaps
    // Overlap condition: existingStart < newEnd AND existingEnd > newStart
    const overlaps = await tx.booking.findMany({
      where: {
        assetId,
        status: { in: ["UPCOMING", "ONGOING"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    })

    if (overlaps.length > 0) {
      throw new BookingOverlapError()
    }

    // 3. Create booking
    const booking = await tx.booking.create({
      data: {
        assetId,
        bookedById: userId,
        startTime,
        endTime,
        status: "UPCOMING",
      },
    })

    // 4. Create reminder notification
    // Note: A true robust system would use a task queue (e.g. Inngest, BullMQ) for timed delivery.
    // For this scope, we just write the Notification immediately with a message indicating it's a reminder.
    await tx.notification.create({
      data: {
        userId,
        type: "BOOKING_REMINDER",
        message: `Reminder: You have an upcoming booking for asset ${assetId} at ${startTime.toLocaleString()}`,
      },
    })

    // 5. Log activity
    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "BOOKING_CREATED",
        entity: "ASSET",
        entityId: assetId,
        metadata: { bookingId: booking.id, startTime, endTime },
      },
    })

    return booking
  })
}

export async function cancelBooking(bookingId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new Error("Booking not found.")

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })

    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "BOOKING_CANCELLED",
        entity: "ASSET",
        entityId: booking.assetId,
        metadata: { bookingId },
      },
    })

    return updated
  })
}

export async function rescheduleBooking(
  bookingId: string,
  userId: string,
  newStart: Date,
  newEnd: Date
) {
  if (newStart >= newEnd) {
    throw new Error("End time must be after start time.")
  }

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new Error("Booking not found.")
    
    // 1. Lock the Asset row
    await tx.$executeRawUnsafe(`SELECT 1 FROM "Asset" WHERE id = $1 FOR UPDATE`, booking.assetId)

    // 2. Check for overlaps (excluding the current booking being rescheduled)
    const overlaps = await tx.booking.findMany({
      where: {
        assetId: booking.assetId,
        id: { not: bookingId },
        status: { in: ["UPCOMING", "ONGOING"] },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    })

    if (overlaps.length > 0) {
      throw new BookingOverlapError()
    }

    // 3. Update booking
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        startTime: newStart,
        endTime: newEnd,
      },
    })

    // 4. Log activity
    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "BOOKING_RESCHEDULED",
        entity: "ASSET",
        entityId: booking.assetId,
        metadata: { bookingId, oldStart: booking.startTime, oldEnd: booking.endTime, newStart, newEnd },
      },
    })

    return updated
  })
}
