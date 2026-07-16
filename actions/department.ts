"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import * as deptService from "@/services/department.service"
import { departmentSchema, type DepartmentFormData } from "@/features/org-setup/schemas"

export async function createDepartmentAction(data: DepartmentFormData) {
  const user = await getCurrentUser()
  if (!user || user.dbRole !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const parsed = departmentSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  try {
    await deptService.createDepartment(parsed.data)
    revalidatePath("/org-setup")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to create department" }
  }
}

export async function updateDepartmentAction(id: string, data: DepartmentFormData) {
  const user = await getCurrentUser()
  if (!user || user.dbRole !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const parsed = departmentSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  try {
    await deptService.updateDepartment(id, parsed.data)
    revalidatePath("/org-setup")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to update department" }
  }
}

export async function deactivateDepartmentAction(id: string) {
  const user = await getCurrentUser()
  if (!user || user.dbRole !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await deptService.deactivateDepartment(id)
    revalidatePath("/org-setup")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Failed to deactivate department" }
  }
}
