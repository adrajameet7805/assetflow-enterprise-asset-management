import { describe, it, expect, vi, beforeEach } from "vitest"
import { updateRequestStatus, resolveRequest } from "../maintenance.service"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    maintenanceRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    allocation: {
      findFirst: vi.fn(),
    },
    asset: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    }
  }
}))

describe("Maintenance Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.$transaction as any).mockImplementation(async (cb: any) => {
      return cb(prisma)
    })
  })

  describe("updateRequestStatus", () => {
    it("should transition asset to UNDER_MAINTENANCE on APPROVE", async () => {
      ;(prisma.maintenanceRequest.findUnique as any).mockResolvedValue({ id: "req-1", assetId: "asset-1" })
      ;(prisma.asset.findUnique as any).mockResolvedValue({ status: "ALLOCATED" })
      
      await updateRequestStatus("req-1", "APPROVED", "admin-1")

      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: "asset-1" },
        data: { status: "UNDER_MAINTENANCE" }
      })
    })

    it("should NOT transition asset status on REJECT", async () => {
      ;(prisma.maintenanceRequest.findUnique as any).mockResolvedValue({ id: "req-1", assetId: "asset-1" })
      
      await updateRequestStatus("req-1", "REJECTED", "admin-1")

      expect(prisma.asset.update).not.toHaveBeenCalled()
    })
  })

  describe("resolveRequest", () => {
    it("should revert to ALLOCATED if an active allocation exists", async () => {
      ;(prisma.maintenanceRequest.findUnique as any).mockResolvedValue({ id: "req-1", assetId: "asset-1" })
      // mock active allocation
      ;(prisma.allocation.findFirst as any).mockResolvedValue({ id: "alloc-1" })
      ;(prisma.asset.findUnique as any).mockResolvedValue({ status: "UNDER_MAINTENANCE" })
      
      await resolveRequest("req-1", "Fixed", "admin-1")

      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: "asset-1" },
        data: { status: "ALLOCATED" }
      })
    })

    it("should revert to AVAILABLE if no active allocation exists", async () => {
      ;(prisma.maintenanceRequest.findUnique as any).mockResolvedValue({ id: "req-1", assetId: "asset-1" })
      // mock NO active allocation
      ;(prisma.allocation.findFirst as any).mockResolvedValue(null)
      ;(prisma.asset.findUnique as any).mockResolvedValue({ status: "UNDER_MAINTENANCE" })
      
      await resolveRequest("req-1", "Fixed", "admin-1")

      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: "asset-1" },
        data: { status: "AVAILABLE" }
      })
    })
  })
})
