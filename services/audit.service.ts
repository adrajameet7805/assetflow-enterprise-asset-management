import { prisma } from "@/lib/prisma"
import { transitionAssetStatus } from "./asset-transition.service"
import { AuditItemStatus } from "@prisma/client"

export async function createAuditCycle(
  scopeDeptId: string | null,
  location: string | null,
  startDate: Date,
  endDate: Date,
  auditorIds: string[],
  adminId: string
) {
  if (auditorIds.length === 0) {
    throw new Error("At least one auditor must be assigned.")
  }

  return prisma.$transaction(async (tx) => {
    // Determine scope
    const whereClause: any = {}
    if (scopeDeptId) whereClause.departmentId = scopeDeptId
    if (location) whereClause.location = location

    const assetsToAudit = await tx.asset.findMany({
      where: whereClause,
      select: { id: true },
    })

    if (assetsToAudit.length === 0) {
      throw new Error("No assets found in the specified scope.")
    }

    // Create cycle
    const cycle = await tx.auditCycle.create({
      data: {
        scopeDeptId,
        location,
        startDate,
        endDate,
        closed: false,
      },
    })

    // Create Audit Items assigning round-robin
    const auditItemData = assetsToAudit.map((asset, index) => {
      const assignedAuditorId = auditorIds[index % auditorIds.length]
      return {
        auditCycleId: cycle.id,
        assetId: asset.id,
        auditorId: assignedAuditorId,
      }
    })

    await tx.auditItem.createMany({
      data: auditItemData,
    })

    await tx.activityLog.create({
      data: {
        actorId: adminId,
        action: "AUDIT_CYCLE_CREATED",
        entity: "AUDIT",
        entityId: cycle.id,
        metadata: { assetsCount: assetsToAudit.length, scopeDeptId, location },
      },
    })

    return cycle
  })
}

export async function updateAuditItemStatus(
  itemId: string,
  status: AuditItemStatus,
  note: string | null,
  auditorId: string
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.auditItem.findUnique({
      where: { id: itemId },
      include: { auditCycle: true },
    })

    if (!item) throw new Error("Audit item not found.")
    if (item.auditCycle.closed) throw new Error("Cannot update items in a closed audit cycle.")
    if (item.auditorId !== auditorId) throw new Error("You are not assigned to this item.")

    const updated = await tx.auditItem.update({
      where: { id: itemId },
      data: { status, note },
    })

    return updated
  })
}

export async function closeAuditCycle(cycleId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    const cycle = await tx.auditCycle.findUnique({ where: { id: cycleId } })
    if (!cycle) throw new Error("Audit cycle not found.")
    if (cycle.closed) throw new Error("Audit cycle is already closed.")

    // Lock and close cycle
    await tx.auditCycle.update({
      where: { id: cycleId },
      data: { closed: true },
    })

    // Find MISSING items
    const missingItems = await tx.auditItem.findMany({
      where: { auditCycleId: cycleId, status: "MISSING" },
    })

    // Transition each to LOST
    for (const item of missingItems) {
      await transitionAssetStatus(tx, {
        assetId: item.assetId,
        toStatus: "LOST",
        actorId: adminId,
        reason: `Marked MISSING in Audit Cycle ${cycleId}`,
      })
    }

    await tx.activityLog.create({
      data: {
        actorId: adminId,
        action: "AUDIT_CYCLE_CLOSED",
        entity: "AUDIT",
        entityId: cycleId,
        metadata: { missingCount: missingItems.length },
      },
    })

    return true
  })
}
