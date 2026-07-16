"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as assetService from "@/services/asset.service"
import { registerAssetSchema, type RegisterAssetFormData } from "@/features/assets/schemas"

export async function registerAssetAction(data: RegisterAssetFormData) {
  const user = await getCurrentUser()
  // Ensure the user has the right permissions (ADMIN or ASSET_MANAGER)
  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    return { error: "Unauthorized" }
  }

  const parsed = registerAssetSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  try {
    const payload = {
      ...parsed.data,
      isBookable: parsed.data.isBookable ?? false,
      photoUrls: parsed.data.photoUrls ?? [],
      documentUrls: parsed.data.documentUrls ?? [],
      acquisitionDate: parsed.data.acquisitionDate ? new Date(parsed.data.acquisitionDate) : null,
      departmentId: parsed.data.departmentId === "none" ? null : parsed.data.departmentId,
    }

    const asset = await assetService.createAsset(payload)
    revalidatePath("/assets")
    return { success: true, assetId: asset.id }
  } catch (e: any) {
    return { error: e.message || "Failed to register asset" }
  }
}
