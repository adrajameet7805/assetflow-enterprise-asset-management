import { AssetStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"

const ALLOWED_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: ["ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "RETIRED", "DISPOSED", "LOST"],
  ALLOCATED: ["AVAILABLE", "UNDER_MAINTENANCE", "LOST", "RETIRED"],
  RESERVED: ["AVAILABLE", "ALLOCATED"],
  UNDER_MAINTENANCE: ["AVAILABLE", "ALLOCATED", "RETIRED", "DISPOSED", "LOST"],
  LOST: ["AVAILABLE", "RETIRED", "DISPOSED"],
  RETIRED: ["DISPOSED"],
  DISPOSED: [],
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: AssetStatus, to: AssetStatus) {
    super(`Invalid asset status transition from ${from} to ${to}`)
    this.name = "InvalidStatusTransitionError"
  }
}

export async function transitionAssetStatus(
  tx: Prisma.TransactionClient,
  params: {
    assetId: string
    toStatus: AssetStatus
    actorId: string
    reason: string
  }
) {
  const { assetId, toStatus, actorId, reason } = params

  const asset = await tx.asset.findUnique({
    where: { id: assetId },
    select: { status: true },
  })

  if (!asset) {
    throw new Error("Asset not found")
  }

  const allowedTo = ALLOWED_TRANSITIONS[asset.status]
  
  if (!allowedTo.includes(toStatus)) {
    throw new InvalidStatusTransitionError(asset.status, toStatus)
  }

  // Update asset
  const updatedAsset = await tx.asset.update({
    where: { id: assetId },
    data: { status: toStatus },
  })

  // Write ActivityLog row
  await tx.activityLog.create({
    data: {
      actorId,
      action: "STATUS_CHANGE",
      entity: "ASSET",
      entityId: assetId,
      metadata: {
        oldStatus: asset.status,
        newStatus: toStatus,
        reason,
      },
    },
  })

  return updatedAsset
}
