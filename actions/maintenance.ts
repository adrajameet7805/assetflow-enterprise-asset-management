"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as maintenanceService from "@/services/maintenance.service"

export async function raiseMaintenanceAction(data: {
  assetId: string
  issue: string
  priority: string
  photoUrl?: string | null
}) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    await maintenanceService.raiseRequest(
      data.assetId,
      user.id,
      data.issue,
      data.priority,
      data.photoUrl
    )
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to raise maintenance request" }
  }
}

export async function updateMaintenanceStatusAction(data: {
  requestId: string
  assetId: string
  newStatus: "APPROVED" | "REJECTED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS"
  technicianId?: string
}) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    await maintenanceService.updateRequestStatus(
      data.requestId,
      data.newStatus,
      user.id,
      data.technicianId
    )
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to update status" }
  }
}

export async function resolveMaintenanceAction(data: {
  requestId: string
  assetId: string
  resolutionNote: string
}) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    await maintenanceService.resolveRequest(
      data.requestId,
      data.resolutionNote,
      user.id
    )
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to resolve maintenance" }
  }
}
