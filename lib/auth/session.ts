import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

// ─── Types ────────────────────────────────────────────────────────────────────
export type SessionPayload = {
  userId: string
  role: string
  name: string
  email: string
}

// ─── Secret ───────────────────────────────────────────────────────────────────
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "assetflow-dev-secret-change-in-production-32chars"
)

const COOKIE_NAME = "assetflow_session"
const SESSION_DURATION_HOURS = 24

// ─── Encrypt / Decrypt ───────────────────────────────────────────────────────
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_HOURS}h`)
    .sign(secret)
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Session Management ───────────────────────────────────────────────────────
export async function createSession(data: SessionPayload): Promise<void> {
  const token = await encrypt(data)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * SESSION_DURATION_HOURS,
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return decrypt(token)
}
