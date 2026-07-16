import { prisma } from "@/lib/prisma"
import { AssetStatus, Prisma } from "@prisma/client"

export async function createAsset(data: {
  name: string
  categoryId: string
  serialNumber?: string | null
  acquisitionDate?: Date | null
  acquisitionCost?: number | null
  condition: string
  location: string
  photoUrls?: string[]
  documentUrls?: string[]
  isBookable: boolean
  departmentId?: string | null
}) {
  return prisma.$transaction(async (tx) => {
    // Increment the tag sequence safely
    const sequence = await tx.tagSequence.update({
      where: { id: "ASSET" },
      data: { value: { increment: 1 } },
    })

    // Format as AF-0001
    const tag = `AF-${sequence.value.toString().padStart(4, "0")}`

    const asset = await tx.asset.create({
      data: {
        tag,
        name: data.name,
        categoryId: data.categoryId,
        serialNumber: data.serialNumber,
        acquisitionDate: data.acquisitionDate,
        acquisitionCost: data.acquisitionCost,
        condition: data.condition,
        location: data.location,
        photoUrls: data.photoUrls || [],
        documentUrls: data.documentUrls || [],
        isBookable: data.isBookable,
        departmentId: data.departmentId,
        status: "AVAILABLE",
      },
    })

    return asset
  })
}



export async function getAssets(
  filters: {
    search?: string
    categoryId?: string
    status?: AssetStatus
    departmentId?: string
    location?: string
  },
  page = 1,
  pageSize = 10
) {
  const where: Prisma.AssetWhereInput = {}

  if (filters.search) {
    where.OR = [
      { tag: { contains: filters.search, mode: "insensitive" } },
      { serialNumber: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId
  }

  if (filters.location) {
    where.location = filters.location
  }

  const [total, items] = await prisma.$transaction([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      include: {
        category: true,
        department: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { tag: "desc" },
    }),
  ])

  return { total, items, totalPages: Math.ceil(total / pageSize) }
}

export async function getAssetDetails(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
      department: true,
      allocations: {
        include: { employee: true, department: true },
        orderBy: { allocatedAt: "desc" },
      },
      bookings: {
        include: { bookedBy: true },
        orderBy: { startTime: "asc" },
      },
      maintenanceRequests: {
        include: { raisedBy: true, technician: true },
        orderBy: { id: "desc" }, // or createdAt if we had it, fallback to id
      },
    },
  })
}
