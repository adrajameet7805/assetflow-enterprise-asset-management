import { getSession } from "./auth/session"
import { prisma } from "./prisma"

/**
 * Returns the full Prisma User record for the currently logged-in user,
 * sourced from the HTTP-only JWT cookie. Returns null if unauthenticated.
 */
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })

  if (!user) return null

  // Map SQLite fields to Supabase legacy fields for backward compatibility
  return {
    ...user,
    dbRole: user.role,
    user_metadata: { name: user.name }
  }
}

/**
 * Lightweight helper — returns just the session payload (no DB hit).
 * Use this for middleware-level role checks.
 */
export { getSession as getSessionUser }
