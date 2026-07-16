import { prisma } from "@/lib/prisma"
import { transitionAssetStatus } from "./asset-transition.service"

export class AllocationConflictError extends Error {
  public holderName: string
  public allocationId: string

  constructor(holderName: string, allocationId: string) {
    super(`Conflict: currently held by ${holderName}`)
    this.name = "AllocationConflictError"
    this.holderName = holderName
    this.allocationId = allocationId
  }
}

export async function checkAllocationConflict(assetId: string) {
  const activeAllocation = await prisma.allocation.findFirst({
    where: { assetId, returnedAt: null },
    include: { employee: true, department: true },
  })

  if (activeAllocation) {
    const holderName = activeAllocation.employee?.name || activeAllocation.department?.name || "Unknown"
    throw new AllocationConflictError(holderName, activeAllocation.id)
  }
}

export async function allocateAsset(
  assetId: string,
  targetType: "EMPLOYEE" | "DEPARTMENT",
  targetId: string,
  expectedReturnDate: Date | null,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Transactional check & lock
    await tx.$executeRawUnsafe(`SELECT 1 FROM "Asset" WHERE id = $1 FOR UPDATE`, assetId)

    const activeAllocation = await tx.allocation.findFirst({
      where: { assetId, returnedAt: null },
      include: { employee: true, department: true },
    })

    if (activeAllocation) {
      const holderName = activeAllocation.employee?.name || activeAllocation.department?.name || "Unknown"
      throw new AllocationConflictError(holderName, activeAllocation.id)
    }

    await transitionAssetStatus(tx, {
      assetId,
      toStatus: "ALLOCATED",
      actorId,
      reason: `Allocated to ${targetType} ${targetId}`,
    })

    // 2. Create the new allocation
    const allocation = await tx.allocation.create({
      data: {
        assetId,
        employeeId: targetType === "EMPLOYEE" ? targetId : null,
        departmentId: targetType === "DEPARTMENT" ? targetId : null,
        expectedReturnDate,
      },
    })

    // 3. Log activity
    await tx.activityLog.create({
      data: {
        actorId,
        action: "ASSET_ALLOCATED",
        entity: "ASSET",
        entityId: assetId,
        metadata: { allocationId: allocation.id, targetType, targetId },
      },
    })

    return allocation
  })
}

export async function requestTransfer(
  allocationId: string,
  targetType: "EMPLOYEE" | "DEPARTMENT",
  targetId: string,
  expectedReturnDate: Date | null,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const allocation = await tx.allocation.findUnique({ where: { id: allocationId } })
    if (!allocation || allocation.returnedAt) {
      throw new Error("Cannot request transfer for a closed or invalid allocation.")
    }

    const updated = await tx.allocation.update({
      where: { id: allocationId },
      data: {
        transferStatus: "REQUESTED",
        transferRequestedById: targetType === "EMPLOYEE" ? targetId : null,
        transferRequestedDeptId: targetType === "DEPARTMENT" ? targetId : null,
        transferExpectedReturnDate: expectedReturnDate,
      },
    })

    await tx.activityLog.create({
      data: {
        actorId,
        action: "TRANSFER_REQUESTED",
        entity: "ALLOCATION",
        entityId: allocationId,
        metadata: { targetType, targetId },
      },
    })

    return updated
  })
}

export async function approveTransfer(allocationId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const oldAllocation = await tx.allocation.findUnique({ where: { id: allocationId } })
    if (!oldAllocation || oldAllocation.transferStatus !== "REQUESTED") {
      throw new Error("Invalid transfer request.")
    }
    
    if (!oldAllocation.transferRequestedById && !oldAllocation.transferRequestedDeptId) {
      throw new Error("Missing transfer target.")
    }

    // Close old allocation
    await tx.allocation.update({
      where: { id: allocationId },
      data: {
        returnedAt: new Date(),
        conditionOnReturn: "Transferred to new owner",
        transferStatus: "REALLOCATED",
      },
    })

    // Open new allocation
    const newAllocation = await tx.allocation.create({
      data: {
        assetId: oldAllocation.assetId,
        employeeId: oldAllocation.transferRequestedById,
        departmentId: oldAllocation.transferRequestedDeptId,
        expectedReturnDate: oldAllocation.transferExpectedReturnDate,
      },
    })

    await tx.activityLog.create({
      data: {
        actorId,
        action: "TRANSFER_APPROVED",
        entity: "ASSET",
        entityId: oldAllocation.assetId,
        metadata: { oldAllocationId: allocationId, newAllocationId: newAllocation.id },
      },
    })

    return newAllocation
  })
}

export async function returnAllocation(
  allocationId: string,
  conditionOnReturn: string,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const allocation = await tx.allocation.update({
      where: { id: allocationId },
      data: {
        returnedAt: new Date(),
        conditionOnReturn,
      },
    })

    await transitionAssetStatus(tx, {
      assetId: allocation.assetId,
      toStatus: "AVAILABLE",
      actorId,
      reason: "Asset returned from allocation",
    })

    await tx.activityLog.create({
      data: {
        actorId,
        action: "ASSET_RETURNED",
        entity: "ASSET",
        entityId: allocation.assetId,
        metadata: { allocationId, conditionOnReturn },
      },
    })

    return allocation
  })
}

export async function getOverdueAllocations() {
  return prisma.allocation.findMany({
    where: {
      returnedAt: null,
      expectedReturnDate: {
        lt: new Date()
      }
    },
    include: {
      asset: true,
      employee: true,
      department: true
    }
  })
}
