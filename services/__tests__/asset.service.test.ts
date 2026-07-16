import { describe, it, expect, vi, beforeEach } from "vitest"
import { createAsset } from "../asset.service"
import { prisma } from "@/lib/prisma"
import { AssetStatus } from "@prisma/client"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    tagSequence: {
      update: vi.fn(),
    },
    asset: {
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    }
  }
}))

describe("Asset Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.$transaction as any).mockImplementation(async (cb: any) => {
      if (Array.isArray(cb)) {
        return Promise.all(cb)
      }
      return cb(prisma)
    })
  })

  describe("createAsset", () => {
    it("should generate a sequential tag and create asset", async () => {
      ;(prisma.tagSequence.update as any).mockResolvedValue({ value: 42 })
      ;(prisma.asset.create as any).mockImplementation(({ data }: any) => Promise.resolve({ id: "a1", ...data }))

      const result = await createAsset({
        name: "Test Laptop",
        categoryId: "c1",
        condition: "GOOD",
        location: "Desk 1",
        isBookable: false,
      })

      expect(prisma.tagSequence.update).toHaveBeenCalledWith({
        where: { id: "ASSET" },
        data: { value: { increment: 1 } }
      })

      expect(result.tag).toBe("AF-0042")
      expect(result.status).toBe("AVAILABLE")
    })
  })

})
