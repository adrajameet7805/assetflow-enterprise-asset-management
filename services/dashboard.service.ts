import { prisma } from "@/lib/prisma"

export async function getDashboardKPIs(user: any) {
  const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)
  const isDeptHead = user.dbRole === "DEPARTMENT_HEAD"

  // Base scope based on role
  const deptScope = isAdminOrManager ? {} : (isDeptHead && user.departmentId ? { departmentId: user.departmentId } : { id: "never_match" })
  const employeeScope = isAdminOrManager ? {} : { employeeId: user.id }
  const employeeBookingScope = isAdminOrManager ? {} : { bookedById: user.id }
  const employeeAssetScope = isAdminOrManager ? {} : { id: "never_match" } // Employees don't manage assets broadly

  // Assets Available
  const assetsAvailable = await prisma.asset.count({
    where: { status: "AVAILABLE", ...deptScope }
  })

  // Assets Allocated
  const assetsAllocated = await prisma.asset.count({
    where: { status: "ALLOCATED", ...deptScope }
  })

  // Maintenance Today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maintenanceToday = await prisma.maintenanceRequest.count({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS", "TECHNICIAN_ASSIGNED"] },
      asset: deptScope,
    }
  })

  // Active Bookings
  const activeBookings = await prisma.booking.count({
    where: {
      status: { not: "CANCELLED" },
      startTime: { lte: new Date() },
      endTime: { gte: new Date() },
      ...employeeBookingScope
    }
  })

  // Pending Transfers
  const pendingTransfers = await prisma.allocation.count({
    where: {
      transferStatus: "REQUESTED",
      ...deptScope
    }
  })

  // Returns
  const now = new Date()
  const allocationsWithReturns = await prisma.allocation.findMany({
    where: {
      returnedAt: null,
      expectedReturnDate: { not: null },
      ...(isAdminOrManager ? {} : (isDeptHead ? { departmentId: user.departmentId } : { employeeId: user.id }))
    },
    include: {
      asset: { select: { tag: true, name: true, status: true } },
      employee: { select: { name: true } }
    },
    orderBy: { expectedReturnDate: "asc" }
  })

  const upcomingReturns = allocationsWithReturns.filter(a => a.expectedReturnDate! >= now)
  const overdueReturns = allocationsWithReturns.filter(a => a.expectedReturnDate! < now)

  return {
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns
  }
}

export async function getAnalyticsReports(user: any) {
  // Only Admin/Manager can view full analytics for now
  if (!["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    throw new Error("Unauthorized")
  }

  // 1. Department Allocation Summary
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: { allocations: { where: { returnedAt: null } } }
      }
    }
  })
  const deptAllocations = departments.map(d => ({
    name: d.name,
    value: d._count.allocations
  })).filter(d => d.value > 0)

  // 2. Asset Status Distribution
  const statuses = await prisma.asset.groupBy({
    by: ['status'],
    _count: { status: true }
  })
  const statusDistribution = statuses.map(s => ({
    name: s.status,
    value: s._count.status
  }))

  // 3. Maintenance Frequency by Category
  const categories = await prisma.assetCategory.findMany({
    include: {
      assets: {
        include: {
          _count: { select: { maintenanceRequests: true } }
        }
      }
    }
  })
  const maintenanceFreq = categories.map(c => {
    const totalRequests = c.assets.reduce((sum, a) => sum + a._count.maintenanceRequests, 0)
    return {
      name: c.name,
      requests: totalRequests
    }
  }).filter(c => c.requests > 0)

  return {
    deptAllocations,
    statusDistribution,
    maintenanceFreq
  }
}
