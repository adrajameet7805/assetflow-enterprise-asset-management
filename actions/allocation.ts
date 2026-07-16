"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as allocationService from "@/services/allocation.service"

export async function allocateAction(data: {
  assetId: string
  targetType: "EMPLOYEE" | "DEPARTMENT"
  targetId: string
  expectedReturnDate: string | null
}) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    const expectedReturnDate = data.expectedReturnDate ? new Date(data.expectedReturnDate) : null
    const allocation = await allocationService.allocateAsset(
      data.assetId,
      data.targetType,
      data.targetId,
      expectedReturnDate,
      user.id
    )
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true, allocationId: allocation.id }
  } catch (e: any) {
    if (e.name === "AllocationConflictError") {
      return { 
        conflict: true, 
        holderName: e.holderName, 
        allocationId: e.allocationId,
        error: e.message 
      }
    }
    return { error: e.message || "Failed to allocate asset" }
  }
}

export async function requestTransferAction(data: {
  allocationId: string
  assetId: string
  targetType: "EMPLOYEE" | "DEPARTMENT"
  targetId: string
  expectedReturnDate: string | null
}) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    const expectedReturnDate = data.expectedReturnDate ? new Date(data.expectedReturnDate) : null
    await allocationService.requestTransfer(
      data.allocationId,
      data.targetType,
      data.targetId,
      expectedReturnDate,
      user.id
    )
    revalidatePath(`/assets/${data.assetId}`)
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to request transfer" }
  }
}

export async function approveTransferAction(allocationId: string, assetId: string) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    await allocationService.approveTransfer(allocationId, user.id)
    revalidatePath(`/assets/${assetId}`)
    revalidatePath("/assets")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to approve transfer" }
  }
}

export async function returnAllocationAction(data: {
  allocationId: string
  assetId: string
  conditionOnReturn: string
}) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  try {
    await allocationService.returnAllocation(data.allocationId, data.conditionOnReturn, user.id)
    revalidatePath(`/assets/${data.assetId}`)
    revalidatePath("/assets")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to return asset" }
  }
}
