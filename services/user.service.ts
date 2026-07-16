import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function promoteUser(userId: string, newRole: UserRole) {
  // Only allow promotion to Department Head or Asset Manager per rules, but Admin can also make someone Admin
  // The UI will likely just provide options. We will accept any valid UserRole.
  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })
}

export async function getUsers() {
  return prisma.user.findMany({
    include: {
      department: true
    },
    orderBy: { name: 'asc' }
  })
}
