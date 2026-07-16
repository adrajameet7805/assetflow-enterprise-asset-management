import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PASSWORD = "AssetFlow@123"

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log("=========================================")
  console.log("  AssetFlow — Seeding local SQLite DB")
  console.log("=========================================")

  // ─── Departments ──────────────────────────────────────────────────────────
  const hq = await prisma.department.upsert({
    where: { id: "dept-hq" },
    update: {},
    create: { id: "dept-hq", name: "Headquarters", status: "ACTIVE" },
  })
  console.log("✓ Department: Headquarters")

  const engineering = await prisma.department.upsert({
    where: { id: "dept-eng" },
    update: {},
    create: { id: "dept-eng", name: "Engineering", parentId: hq.id, status: "ACTIVE" },
  })
  console.log("✓ Department: Engineering")

  const ops = await prisma.department.upsert({
    where: { id: "dept-ops" },
    update: {},
    create: { id: "dept-ops", name: "Operations", parentId: hq.id, status: "ACTIVE" },
  })
  console.log("✓ Department: Operations")

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminHash   = await hashPassword(PASSWORD)
  const managerHash = await hashPassword(PASSWORD)
  const headHash    = await hashPassword(PASSWORD)
  const empHash     = await hashPassword(PASSWORD)

  const admin = await prisma.user.upsert({
    where: { email: "admin@assetflow.com" },
    update: { passwordHash: adminHash, role: "ADMIN", status: "ACTIVE", name: "Super Admin" },
    create: {
      id: "user-admin",
      email: "admin@assetflow.com",
      name: "Super Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      departmentId: hq.id,
      status: "ACTIVE",
    },
  })
  console.log("✓ User: admin@assetflow.com (ADMIN)")

  const manager = await prisma.user.upsert({
    where: { email: "manager@assetflow.com" },
    update: { passwordHash: managerHash, role: "ASSET_MANAGER", status: "ACTIVE", name: "Asset Manager" },
    create: {
      id: "user-manager",
      email: "manager@assetflow.com",
      name: "Asset Manager",
      passwordHash: managerHash,
      role: "ASSET_MANAGER",
      departmentId: hq.id,
      status: "ACTIVE",
    },
  })
  console.log("✓ User: manager@assetflow.com (ASSET_MANAGER)")

  const deptHead = await prisma.user.upsert({
    where: { email: "department@assetflow.com" },
    update: { passwordHash: headHash, role: "DEPARTMENT_HEAD", status: "ACTIVE", name: "Department Head" },
    create: {
      id: "user-depthead",
      email: "department@assetflow.com",
      name: "Department Head",
      passwordHash: headHash,
      role: "DEPARTMENT_HEAD",
      departmentId: engineering.id,
      status: "ACTIVE",
    },
  })
  console.log("✓ User: department@assetflow.com (DEPARTMENT_HEAD)")

  const employee = await prisma.user.upsert({
    where: { email: "employee@assetflow.com" },
    update: { passwordHash: empHash, role: "EMPLOYEE", status: "ACTIVE", name: "Employee User" },
    create: {
      id: "user-employee",
      email: "employee@assetflow.com",
      name: "Employee User",
      passwordHash: empHash,
      role: "EMPLOYEE",
      departmentId: engineering.id,
      status: "ACTIVE",
    },
  })
  console.log("✓ User: employee@assetflow.com (EMPLOYEE)")

  // Set dept head
  await prisma.department.update({
    where: { id: engineering.id },
    data: { headId: deptHead.id },
  })

  // ─── Asset Category ───────────────────────────────────────────────────────
  await prisma.assetCategory.upsert({
    where: { id: "cat-hardware" },
    update: {},
    create: { id: "cat-hardware", name: "Hardware & Equipment" },
  })
  console.log("✓ Asset Category: Hardware & Equipment")

  // ─── Tag sequence ─────────────────────────────────────────────────────────
  await prisma.tagSequence.upsert({
    where: { id: "ASSET" },
    update: {},
    create: { id: "ASSET", value: 0 },
  })

  console.log("=========================================")
  console.log("  Seeding complete!")
  console.log("-----------------------------------------")
  console.log(" Login accounts (password: AssetFlow@123)")
  console.log(" - Super Admin:    admin@assetflow.com")
  console.log(" - Asset Manager:  manager@assetflow.com")
  console.log(" - Dept Head:      department@assetflow.com")
  console.log(" - Employee:       employee@assetflow.com")
  console.log("=========================================")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
