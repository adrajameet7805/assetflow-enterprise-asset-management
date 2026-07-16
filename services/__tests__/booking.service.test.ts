import { describe, it, expect, vi, beforeEach } from "vitest"
import { bookAsset, BookingOverlapError } from "../booking.service"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    $executeRawUnsafe: vi.fn(),
    booking: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    }
  }
}))

describe("Booking Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.$transaction as any).mockImplementation(async (cb: any) => {
      return cb(prisma)
    })
  })

  describe("bookAsset overlap validation", () => {
    it("should succeed if no overlaps exist", async () => {
      ;(prisma.booking.findMany as any).mockResolvedValue([])
      ;(prisma.booking.create as any).mockResolvedValue({ id: "b1" })

      const start = new Date("2026-07-12T10:00:00Z")
      const end = new Date("2026-07-12T11:00:00Z")

      const result = await bookAsset("asset-1", "user-1", start, end)
      
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          assetId: "asset-1",
          status: { in: ["UPCOMING", "ONGOING"] },
          startTime: { lt: end },
          endTime: { gt: start },
        }
      })
      expect(result.id).toBe("b1")
    })

    it("should allow back-to-back booking (new starts exactly when old ends)", async () => {
      const existingEnd = new Date("2026-07-12T10:00:00Z")
      
      // If the query returns empty, it's allowed. We mock findMany to return [] 
      // because in the real DB: startTime(10:00) < endTime(10:00) is FALSE.
      ;(prisma.booking.findMany as any).mockResolvedValue([])
      ;(prisma.booking.create as any).mockResolvedValue({ id: "b2" })

      const start = new Date("2026-07-12T10:00:00Z")
      const end = new Date("2026-07-12T11:00:00Z")

      await expect(bookAsset("asset-1", "user-1", start, end)).resolves.toBeDefined()
    })

    it("should throw BookingOverlapError if an overlap exists", async () => {
      ;(prisma.booking.findMany as any).mockResolvedValue([{ id: "existing" }])

      const start = new Date("2026-07-12T09:30:00Z")
      const end = new Date("2026-07-12T10:30:00Z")

      await expect(bookAsset("asset-1", "user-1", start, end))
        .rejects.toThrow(BookingOverlapError)
    })
    
    it("should fail if start >= end", async () => {
      const start = new Date("2026-07-12T10:00:00Z")
      const end = new Date("2026-07-12T10:00:00Z")

      await expect(bookAsset("asset-1", "user-1", start, end))
        .rejects.toThrow("End time must be after start time.")
    })
  })
})
