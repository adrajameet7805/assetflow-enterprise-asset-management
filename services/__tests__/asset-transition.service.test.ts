import { describe, it, expect, vi, beforeEach } from "vitest"
import { transitionAssetStatus, InvalidStatusTransitionError } from "../asset-transition.service"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    asset: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    }
  }
}))

describe("Asset Transition Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should successfully transition status and log activity on valid transition", async () => {
    const tx = prisma as any

    tx.asset.findUnique.mockResolvedValue({ status: "AVAILABLE" })
    tx.asset.update.mockResolvedValue({ id: "a1", status: "ALLOCATED" })

    await transitionAssetStatus(tx, {
      assetId: "a1",
      toStatus: "ALLOCATED",
      actorId: "admin-1",
      reason: "Allocated to employee"
    })

    expect(tx.asset.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: { status: "ALLOCATED" }
    })

    expect(tx.activityLog.create).toHaveBeenCalledWith({
      data: {
        actorId: "admin-1",
        action: "STATUS_CHANGE",
        entity: "ASSET",
        entityId: "a1",
        metadata: { oldStatus: "AVAILABLE", newStatus: "ALLOCATED", reason: "Allocated to employee" }
      }
    })
  })

  it("should throw InvalidStatusTransitionError on invalid transition", async () => {
    const tx = prisma as any

    tx.asset.findUnique.mockResolvedValue({ status: "LOST" })

    await expect(
      transitionAssetStatus(tx, {
        assetId: "a1",
        toStatus: "ALLOCATED",
        actorId: "admin-1",
        reason: "Allocated to employee"
      })
    ).rejects.toThrow(InvalidStatusTransitionError)
    
    expect(tx.asset.update).not.toHaveBeenCalled()
  })
})
