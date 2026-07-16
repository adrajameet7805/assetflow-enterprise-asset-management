import { prisma } from "@/lib/prisma"

export async function createDepartment(data: { name: string; headId?: string | null; parentId?: string | null; status: string }) {
  // Enforce cycle check on creation too just in case
  if (data.parentId) {
    const parent = await prisma.department.findUnique({ where: { id: data.parentId } })
    if (!parent) {
      throw new Error("Parent department not found")
    }
  }

  return prisma.department.create({
    data: {
      name: data.name,
      headId: data.headId,
      parentId: data.parentId,
      status: data.status
    },
  })
}

export async function updateDepartment(id: string, data: { name: string; headId?: string | null; parentId?: string | null; status: string }) {
  if (data.parentId) {
    if (data.parentId === id) {
      throw new Error("A department cannot be its own parent")
    }
    // Deep cycle check
    let currentParent = await prisma.department.findUnique({ where: { id: data.parentId } })
    while (currentParent) {
      if (currentParent.parentId === id) {
        throw new Error("Cycle detected: Cannot assign a descendant as a parent")
      }
      if (!currentParent.parentId) break
      currentParent = await prisma.department.findUnique({ where: { id: currentParent.parentId } })
    }
  }

  return prisma.department.update({
    where: { id },
    data,
  })
}

export async function deactivateDepartment(id: string) {
  // Check for active employees tied to this department
  const activeUsers = await prisma.user.count({
    where: {
      departmentId: id,
      status: "ACTIVE"
    }
  })

  if (activeUsers > 0) {
    throw new Error(`Cannot deactivate department. There are ${activeUsers} active employees assigned to it. Please reassign them first.`)
  }

  return prisma.department.update({
    where: { id },
    data: { status: "INACTIVE" }
  })
}

export async function getDepartments() {
  return prisma.department.findMany({
    include: {
      parent: true
    },
    orderBy: { name: 'asc' }
  })
}
