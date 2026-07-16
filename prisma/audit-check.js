const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  // 1. Test basic connectivity
  console.log("[Audit] Step 1: Testing Prisma → SQLite connection...")
  try {
    const userCount = await prisma.user.count()
    console.log(`[Audit] ✓ Connection OK. User table exists. Row count: ${userCount}`)
  } catch (e) {
    console.error("[Audit] ✗ Connection or table error:", e)
    process.exit(1)
  }

  // 2. Check each demo user
  const demos = [
    { email: "admin@assetflow.com",      expectedRole: "ADMIN" },
    { email: "manager@assetflow.com",    expectedRole: "ASSET_MANAGER" },
    { email: "department@assetflow.com", expectedRole: "DEPARTMENT_HEAD" },
    { email: "employee@assetflow.com",   expectedRole: "EMPLOYEE" },
  ]

  const PASSWORD = "AssetFlow@123"
  console.log("\n[Audit] Step 2: Verifying demo users...")

  for (const { email, expectedRole } of demos) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, status: true, passwordHash: true },
    })

    if (!user) {
      console.error(`[Audit] ✗ MISSING user: ${email} (expected role: ${expectedRole})`)
      continue
    }

    const passwordValid = await bcrypt.compare(PASSWORD, user.passwordHash)
    const roleMatch = user.role === expectedRole

    console.log(`[Audit] ${passwordValid && roleMatch ? "✓" : "✗"} ${email}`)
    console.log(`        Role: ${user.role} (expected: ${expectedRole}) → ${roleMatch ? "OK" : "MISMATCH"}`)
    console.log(`        Password hash valid: ${passwordValid}`)
    console.log(`        Status: ${user.status}`)
    console.log(`        Hash length: ${user.passwordHash.length}`)
  }

  // 3. Simulate loginAction flow
  console.log("\n[Audit] Step 3: Simulating loginAction for admin@assetflow.com...")
  const user = await prisma.user.findUnique({
    where: { email: "admin@assetflow.com" },
    select: { id: true, name: true, email: true, role: true, status: true, passwordHash: true },
  })
  
  console.log(`[Audit] User found: ${!!user}`)
  if (user) {
    const match = await bcrypt.compare(PASSWORD, user.passwordHash)
    console.log(`[Audit] Password comparison: ${match}`)
    console.log(`[Audit] Role: ${user.role}`)
    console.log(`[Audit] Redirect: /dashboard/${user.role === "ADMIN" ? "admin" : user.role.toLowerCase().replace("_", "-")}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
