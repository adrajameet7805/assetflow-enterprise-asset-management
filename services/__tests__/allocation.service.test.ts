import { describe, it, expect, vi, beforeEach } from "vitest"
import { allocateAsset, AllocationConflictError, approveTransfer } from "../allocation.service"
import { prisma } from "@/lib/prisma"

// Mock the prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    $executeRawUnsafe: vi.fn(),
    allocation: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    asset: {
      updateMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    }
  }
}))

describe("Allocation Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default $transaction mock simply executes the callback with the mocked prisma client
    ;(prisma.$transaction as any).mockImplementation(async (cb: any) => {
      return cb(prisma)
    })
  })

  describe("allocateAsset", () => {
    it("should succeed if the asset is AVAILABLE", async () => {
      ;(prisma.$executeRawUnsafe as any).mockResolvedValue(true)
      ;(prisma.allocation.findFirst as any).mockResolvedValue(null)
      ;(prisma.asset.findUnique as any).mockResolvedValue({ status: "AVAILABLE" })
      ;(prisma.asset.update as any).mockResolvedValue({ status: "ALLOCATED" })
      ;(prisma.allocation.create as any).mockResolvedValue({ id: "alloc-1" })

      const result = await allocateAsset("asset-1", "EMPLOYEE", "user-1", null, "admin-1")

      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: "asset-1" },
        data: { status: "ALLOCATED" }
      })
      expect(prisma.allocation.create).toHaveBeenCalled()
      expect(result.id).toBe("alloc-1")
    })

    it("should throw AllocationConflictError if update fails and an active allocation exists (Overlap check)", async () => {
      ;(prisma.$executeRawUnsafe as any).mockResolvedValue(true)
      
      // findFirst finds the active allocation
      ;(prisma.allocation.findFirst as any).mockResolvedValue({
        id: "alloc-2",
        employee: { name: "John Doe" }
      })

      await expect(allocateAsset("asset-1", "EMPLOYEE", "user-2", null, "admin-1"))
        .rejects.toThrow(AllocationConflictError)
    })

    it("should throw generic error if update fails but no active allocation exists", async () => {
      ;(prisma.$executeRawUnsafe as any).mockResolvedValue(true)
      ;(prisma.allocation.findFirst as any).mockResolvedValue(null)
      ;(prisma.asset.findUnique as any).mockResolvedValue({ status: "ALLOCATED" }) // not available

      await expect(allocateAsset("asset-1", "EMPLOYEE", "user-2", null, "admin-1"))
        .rejects.toThrow()
    })
  })

  describe("approveTransfer", () => {
    it("should close the old allocation and create a new one", async () => {
      const oldAlloc = {
        id: "alloc-1",
        assetId: "asset-1",
        transferStatus: "REQUESTED",
        transferRequestedById: "user-2",
        transferExpectedReturnDate: null
      }
      
      ;(prisma.allocation.findUnique as any).mockResolvedValue(oldAlloc)
      ;(prisma.allocation.create as any).mockResolvedValue({ id: "alloc-new" })

      const result = await approveTransfer("alloc-1", "admin-1")
      
      expect(prisma.allocation.update).toHaveBeenCalledWith({
        where: { id: "alloc-1" },
        data: expect.objectContaining({
          returnedAt: expect.any(Date),
          conditionOnReturn: "Transferred to new owner",
          transferStatus: "REALLOCATED",
        })
      })

      expect(prisma.allocation.create).toHaveBeenCalledWith({
        data: {
          assetId: "asset-1",
          employeeId: "user-2",
          departmentId: undefined, // since requestedDeptId is undefined on oldAlloc
          expectedReturnDate: null
        }
      })
      
      expect(result.id).toBe("alloc-new")
    })
  })
})
