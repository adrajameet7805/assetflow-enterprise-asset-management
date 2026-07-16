"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as bookingService from "@/services/booking.service"

export async function bookAssetAction(data: {
  assetId: string
  startTime: string
  endTime: string
}) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    const start = new Date(data.startTime)
    const end = new Date(data.endTime)
    const booking = await bookingService.bookAsset(data.assetId, user.id, start, end)
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true, bookingId: booking.id }
  } catch (e: any) {
    if (e.name === "BookingOverlapError") {
      return { overlap: true, error: e.message }
    }
    return { error: e.message || "Failed to book asset" }
  }
}

export async function cancelBookingAction(bookingId: string, assetId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    await bookingService.cancelBooking(bookingId, user.id)
    revalidatePath(`/assets/${assetId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to cancel booking" }
  }
}

export async function rescheduleBookingAction(data: {
  bookingId: string
  assetId: string
  newStart: string
  newEnd: string
}) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    const start = new Date(data.newStart)
    const end = new Date(data.newEnd)
    await bookingService.rescheduleBooking(data.bookingId, user.id, start, end)
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true }
  } catch (e: any) {
    if (e.name === "BookingOverlapError") {
      return { overlap: true, error: e.message }
    }
    return { error: e.message || "Failed to reschedule booking" }
  }
}
