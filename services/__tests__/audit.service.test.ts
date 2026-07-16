import { describe, it, expect, vi, beforeEach } from "vitest"
import { createAuditCycle, updateAuditItemStatus, closeAuditCycle } from "../audit.service"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    asset: {
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    auditCycle: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditItem: {
      createMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    }
  }
}))

describe("Audit Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.$transaction as any).mockImplementation(async (cb: any) => {
      return cb(prisma)
    })
  })

  describe("createAuditCycle", () => {
    it("should round-robin auditors for created items", async () => {
      ;(prisma.asset.findMany as any).mockResolvedValue([{ id: "a1" }, { id: "a2" }, { id: "a3" }])
      ;(prisma.auditCycle.create as any).mockResolvedValue({ id: "cycle-1" })
      
      const start = new Date()
      const end = new Date()

      await createAuditCycle("dept-1", null, start, end, ["u1", "u2"], "admin-1")

      expect(prisma.auditItem.createMany).toHaveBeenCalledWith({
        data: [
          { auditCycleId: "cycle-1", assetId: "a1", auditorId: "u1" },
          { auditCycleId: "cycle-1", assetId: "a2", auditorId: "u2" },
          { auditCycleId: "cycle-1", assetId: "a3", auditorId: "u1" },
        ]
      })
    })

    it("should throw if no assets found", async () => {
      ;(prisma.asset.findMany as any).mockResolvedValue([])
      
      await expect(
        createAuditCycle("dept-1", null, new Date(), new Date(), ["u1"], "admin-1")
      ).rejects.toThrow("No assets found in the specified scope.")
    })
  })

  describe("updateAuditItemStatus", () => {
    it("should throw if cycle is closed", async () => {
      ;(prisma.auditItem.findUnique as any).mockResolvedValue({
        id: "item-1",
        auditorId: "u1",
        auditCycle: { closed: true }
      })

      await expect(updateAuditItemStatus("item-1", "VERIFIED", null, "u1"))
        .rejects.toThrow("Cannot update items in a closed audit cycle.")
    })
  })

  describe("closeAuditCycle", () => {
    it("should lock cycle and update MISSING items to LOST", async () => {
      ;(prisma.auditCycle.findUnique as any).mockResolvedValue({ id: "cycle-1", closed: false })
      ;(prisma.auditItem.findMany as any).mockResolvedValue([
        { assetId: "a1", status: "MISSING" },
        { assetId: "a2", status: "MISSING" }
      ])
      ;(prisma.asset.findUnique as any).mockResolvedValue({ status: "ALLOCATED" }) // Valid status to transition from
      ;(prisma.asset.update as any).mockResolvedValue({ status: "LOST" })

      await closeAuditCycle("cycle-1", "admin-1")

      expect(prisma.auditCycle.update).toHaveBeenCalledWith({
        where: { id: "cycle-1" },
        data: { closed: true }
      })

      expect(prisma.asset.update).toHaveBeenCalledTimes(2)
      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { status: "LOST" }
      })
      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: "a2" },
        data: { status: "LOST" }
      })
    })
  })
})
