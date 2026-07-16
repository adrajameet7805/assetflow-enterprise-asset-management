"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getNotificationsAction() {
  const user = await getCurrentUser()
  if (!user) return { data: [] }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  return { data: notifications }
}

export async function markNotificationAsReadAction(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  try {
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { read: true }
    })
    return { success: true }
  } catch (e) {
    return { error: "Failed" }
  }
}
