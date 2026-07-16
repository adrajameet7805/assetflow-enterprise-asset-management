import { type NextRequest, NextResponse } from "next/server"
import { decryptEdge as decrypt } from "@/lib/auth/session-edge"

// ─── Role → allowed dashboard prefix ─────────────────────────────────────────
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  ADMIN:           ["/dashboard/admin", "/dashboard"],
  ASSET_MANAGER:   ["/dashboard/asset-manager", "/dashboard"],
  DEPARTMENT_HEAD: ["/dashboard/department-head", "/dashboard"],
  EMPLOYEE:        ["/dashboard/employee", "/dashboard"],
}

const ROLE_LOGIN_REDIRECT: Record<string, string> = {
  ADMIN:           "/login/admin",
  ASSET_MANAGER:   "/login/asset-manager",
  DEPARTMENT_HEAD: "/login/department-head",
  EMPLOYEE:        "/login/employee",
}

// Public paths that never require authentication
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow server actions
  if (request.headers.get("next-action")) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // ─── Read & decrypt session cookie ───────────────────────────────────────
  const token = request.cookies.get("assetflow_session")?.value
  const session = token ? await decrypt(token) : null

  // ─── Unauthenticated → redirect to login ─────────────────────────────────
  if (!session) {
    if (isPublic) return NextResponse.next()
    const loginUrl = new URL("/login/employee", request.url)
    loginUrl.searchParams.set("redirected", "true")
    return NextResponse.redirect(loginUrl)
  }

  // ─── Authenticated → redirect away from login pages ──────────────────────
  if (isPublic && pathname.startsWith("/login")) {
    const redirectUrl = {
      ADMIN:           "/dashboard/admin",
      ASSET_MANAGER:   "/dashboard/asset-manager",
      DEPARTMENT_HEAD: "/dashboard/department-head",
      EMPLOYEE:        "/dashboard/employee",
    }[session.role] ?? "/dashboard/employee"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // ─── RBAC: protect dashboard routes ──────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const allowed = ROLE_ALLOWED_PREFIXES[session.role] ?? []
    const canAccess = allowed.some((prefix) => pathname.startsWith(prefix))
    if (!canAccess) {
      // Redirect to their correct dashboard
      const correctDash = {
        ADMIN:           "/dashboard/admin",
        ASSET_MANAGER:   "/dashboard/asset-manager",
        DEPARTMENT_HEAD: "/dashboard/department-head",
        EMPLOYEE:        "/dashboard/employee",
      }[session.role] ?? "/dashboard/employee"
      return NextResponse.redirect(new URL(correctDash, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
