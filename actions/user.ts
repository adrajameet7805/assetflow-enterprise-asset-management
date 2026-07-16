"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

const VALID_ROLES = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] as const
type PromotableRole = typeof VALID_ROLES[number]

/**
 * RBAC Rule: Only ADMIN can promote users.
 * Enforced server-side — cannot be bypassed by UI.
 */
export async function promoteUserAction(userId: string, newRole: string) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized: Only Super Admins can promote users." }
  }

  if (!VALID_ROLES.includes(newRole as PromotableRole)) {
    return { error: "Invalid role provided." }
  }

  // Prevent self-demotion
  if (userId === session.userId) {
    return { error: "You cannot change your own role." }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/admin/employees")
    return { success: true }
  } catch (e: any) {
    console.error("Failed to promote user:", e)
    return { error: e.message || "Failed to promote user." }
  }
}
