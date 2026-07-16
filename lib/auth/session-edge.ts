/**
 * Edge-compatible JWT decrypt — NO server-only imports.
 * Used by middleware.ts (Edge runtime).
 */
import { jwtVerify } from "jose"

export type SessionPayload = {
  userId: string
  role: string
  name: string
  email: string
}

const COOKIE_NAME = "assetflow_session"

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET || "assetflow-dev-secret-change-in-production-32chars"
  )
}

export async function decryptEdge(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export { COOKIE_NAME }
