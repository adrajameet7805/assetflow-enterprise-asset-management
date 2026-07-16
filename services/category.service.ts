import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function createCategory(data: { name: string; customFields?: Record<string, string> }) {
  return prisma.assetCategory.create({
    data: {
      name: data.name,
      customFields: data.customFields ? (data.customFields as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  })
}

export async function updateCategory(id: string, data: { name: string; customFields?: Record<string, string> }) {
  return prisma.assetCategory.update({
    where: { id },
    data: {
      name: data.name,
      customFields: data.customFields ? (data.customFields as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  })
}

export async function getCategories() {
  return prisma.assetCategory.findMany({
    orderBy: { name: 'asc' }
  })
}
