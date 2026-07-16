"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as auditService from "@/services/audit.service"
import { AuditItemStatus } from "@prisma/client"

export async function createAuditCycleAction(data: {
  scopeDeptId: string | null
  location: string | null
  startDate: string
  endDate: string
  auditorIds: string[]
}) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    const cycle = await auditService.createAuditCycle(
      data.scopeDeptId,
      data.location,
      new Date(data.startDate),
      new Date(data.endDate),
      data.auditorIds,
      user.id
    )
    revalidatePath("/audits")
    return { success: true, cycleId: cycle.id }
  } catch (e: any) {
    return { error: e.message || "Failed to create audit cycle" }
  }
}

export async function updateAuditItemStatusAction(data: {
  itemId: string
  status: AuditItemStatus
  note: string | null
  cycleId: string
}) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    await auditService.updateAuditItemStatus(
      data.itemId,
      data.status,
      data.note,
      user.id
    )
    revalidatePath(`/audits/${data.cycleId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to update item" }
  }
}

export async function closeAuditCycleAction(cycleId: string) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    await auditService.closeAuditCycle(cycleId, user.id)
    revalidatePath("/audits")
    revalidatePath(`/audits/${cycleId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to close audit cycle" }
  }
}
