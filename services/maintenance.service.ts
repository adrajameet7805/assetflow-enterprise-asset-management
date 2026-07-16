import { prisma } from "@/lib/prisma"
import { transitionAssetStatus } from "./asset-transition.service"

export async function raiseRequest(
  assetId: string,
  userId: string,
  issue: string,
  priority: string,
  photoUrl?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.create({
      data: {
        assetId,
        raisedById: userId,
        issue,
        priority,
        photoUrl,
        status: "PENDING",
      },
    })

    await tx.activityLog.create({
      data: {
        actorId: userId,
        action: "MAINTENANCE_RAISED",
        entity: "ASSET",
        entityId: assetId,
        metadata: { requestId: request.id, issue, priority },
      },
    })

    return request
  })
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: "APPROVED" | "REJECTED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS",
  actorId: string,
  technicianId?: string
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.findUnique({ where: { id: requestId } })
    if (!request) throw new Error("Maintenance request not found")

    const updated = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: { 
        status: newStatus,
        technicianId: technicianId || request.technicianId
      },
    })

    if (newStatus === "APPROVED") {
      // We do NOT clear or close the active Allocation record when approved.
      // The allocation stays open; the asset is merely flagged as unusable during maintenance.
      await transitionAssetStatus(tx, {
        assetId: request.assetId,
        toStatus: "UNDER_MAINTENANCE",
        actorId,
        reason: "Maintenance Approved"
      })
    }

    await tx.activityLog.create({
      data: {
        actorId,
        action: `MAINTENANCE_${newStatus}`,
        entity: "ASSET",
        entityId: request.assetId,
        metadata: { requestId },
      },
    })

    return updated
  })
}

export async function resolveRequest(
  requestId: string,
  resolutionNote: string,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.findUnique({ where: { id: requestId } })
    if (!request) throw new Error("Maintenance request not found")

    const updated = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: { 
        status: "RESOLVED",
        resolutionNote
      },
    })

    // Check if there is an active allocation
    const activeAllocation = await tx.allocation.findFirst({
      where: { assetId: request.assetId, returnedAt: null }
    })

    const targetStatus = activeAllocation ? "ALLOCATED" : "AVAILABLE"

    await transitionAssetStatus(tx, {
      assetId: request.assetId,
      toStatus: targetStatus as any,
      actorId,
      reason: "Maintenance Resolved"
    })

    await tx.activityLog.create({
      data: {
        actorId,
        action: "MAINTENANCE_RESOLVED",
        entity: "ASSET",
        entityId: request.assetId,
        metadata: { requestId, resolutionNote },
      },
    })

    return updated
  })
}
