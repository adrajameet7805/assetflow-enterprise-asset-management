import { describe, it, expect, vi, beforeEach } from "vitest"
import { getDashboardKPIs } from "../dashboard.service"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    asset: { count: vi.fn() },
    maintenanceRequest: { count: vi.fn() },
    booking: { count: vi.fn() },
    allocation: { count: vi.fn(), findMany: vi.fn() },
  }
}))

describe("Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getDashboardKPIs", () => {
    it("should aggregate data based on admin role", async () => {
      const mockAdmin = { id: "admin1", dbRole: "ADMIN" }
      ;(prisma.asset.count as any).mockResolvedValue(10)
      ;(prisma.maintenanceRequest.count as any).mockResolvedValue(5)
      ;(prisma.booking.count as any).mockResolvedValue(2)
      ;(prisma.allocation.count as any).mockResolvedValue(1)
      ;(prisma.allocation.findMany as any).mockResolvedValue([
        { id: "a1", expectedReturnDate: new Date("2099-01-01"), asset: { name: "A" }, employee: { name: "E" } }
      ])

      const result = await getDashboardKPIs(mockAdmin)
      
      expect(prisma.asset.count).toHaveBeenCalledWith({ where: { status: "AVAILABLE" }})
      expect(result.assetsAvailable).toBe(10)
      expect(result.upcomingReturns.length).toBe(1)
      expect(result.overdueReturns.length).toBe(0)
    })
  })
})
