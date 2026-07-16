"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as catService from "@/services/category.service"
import { categorySchema, type CategoryFormData } from "@/features/org-setup/schemas"

export async function createCategoryAction(data: CategoryFormData) {
  const user = await getCurrentUser()
  if (!user || user.dbRole !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  const customFieldsMap = parsed.data.customFields?.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>) || {}

  try {
    await catService.createCategory({
      name: parsed.data.name,
      customFields: Object.keys(customFieldsMap).length > 0 ? customFieldsMap : undefined,
    })
    revalidatePath("/org-setup")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to create category" }
  }
}

export async function updateCategoryAction(id: string, data: CategoryFormData) {
  const user = await getCurrentUser()
  if (!user || user.dbRole !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  const customFieldsMap = parsed.data.customFields?.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>) || {}

  try {
    await catService.updateCategory(id, {
      name: parsed.data.name,
      customFields: Object.keys(customFieldsMap).length > 0 ? customFieldsMap : undefined,
    })
    revalidatePath("/org-setup")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to update category" }
  }
}
