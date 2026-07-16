"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/auth/session"
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from "@/features/auth/schemas"

// ─── Role → portal route mapping ─────────────────────────────────────────────
const ROLE_TO_REDIRECT: Record<string, string> = {
  ADMIN:           "/dashboard/admin",
  ASSET_MANAGER:   "/dashboard/asset-manager",
  DEPARTMENT_HEAD: "/dashboard/department-head",
  EMPLOYEE:        "/dashboard/employee",
}

const ROLE_TO_LOGIN: Record<string, string> = {
  ADMIN:           "/login/admin",
  ASSET_MANAGER:   "/login/asset-manager",
  DEPARTMENT_HEAD: "/login/department-head",
  EMPLOYEE:        "/login/employee",
}

const ROLE_TO_LABEL: Record<string, string> = {
  ADMIN:           "Super Admin",
  ASSET_MANAGER:   "Asset Manager",
  DEPARTMENT_HEAD: "Department Head",
  EMPLOYEE:        "Employee",
}

// ─── Signup ───────────────────────────────────────────────────────────────────
/**
 * RULE #4: Every signup creates an EMPLOYEE — role selection NEVER allowed.
 * Enforced server-side; UI cannot override this.
 */
export async function signUpAction(data: SignupFormData) {
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Invalid data provided." }
  }

  const email = parsed.data.email.trim().toLowerCase()

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "An account with this email already exists." }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: "EMPLOYEE", // Never changes on signup
      status: "ACTIVE",
    },
  })

  return { success: true }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginAction(
  data: LoginFormData,
  expectedRole?: "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE"
) {
  try {
    const parsed = loginSchema.safeParse(data)
    if (!parsed.success) {
      return { error: "Please enter a valid email address and password." }
    }

    const email = parsed.data.email.trim().toLowerCase()
    const password = parsed.data.password

    // ── 1. Look up user in local DB ───────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, status: true, passwordHash: true },
    })

    if (process.env.NODE_ENV === "development") {
      console.log(`[Login] User found: ${!!user}`)
    }

    // ── 2. Validate user exists ───────────────────────────────────────────────
    if (!user) {
      return {
        error: "Unable to sign in. Please check your email and password and try again.",
        rawError: "User not found"
      }
    }

    // ── 3. Check account status ───────────────────────────────────────────────
    if (user.status !== "ACTIVE") {
      return { error: "Your account has been deactivated. Please contact your administrator." }
    }

    // ── 4. Verify password ────────────────────────────────────────────────────
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Login] Password comparison: ${passwordValid}`)
      console.log(`[Login] Role: ${user.role}`)
    }

    if (!passwordValid) {
      return {
        error: "Unable to sign in. Please check your email and password and try again.",
        rawError: "Invalid password"
      }
    }

    // ── 5. Role gate: enforce portal-specific access ──────────────────────────
    if (expectedRole && expectedRole !== user.role) {
      const correctLoginUrl = ROLE_TO_LOGIN[user.role] ?? "/login/employee"
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[Login] Redirect path: ${correctLoginUrl} (Role mismatch)`)
      }

      return {
        success: true,
        wrongRole: true,
        actualRoleString: ROLE_TO_LABEL[user.role] ?? "Employee",
        correctLoginUrl,
      }
    }

    // ── 6. Create JWT session ─────────────────────────────────────────────────
    await createSession({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    })

    const redirectUrl = ROLE_TO_REDIRECT[user.role] ?? "/dashboard/employee"
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Login] Redirect path: ${redirectUrl}`)
    }

    revalidatePath("/", "layout")
    return {
      success: true,
      wrongRole: false,
      redirectUrl,
      userName: user.name,
      actualRoleString: ROLE_TO_LABEL[user.role] ?? "Employee",
      correctLoginUrl: ROLE_TO_LOGIN[user.role] ?? "/login/employee",
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Login] Unexpected error:", error)
    }
    return {
      error: "An unexpected error occurred during login. Please try again later.",
      rawError: error.message
    }
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutAction() {
  await deleteSession()
  revalidatePath("/", "layout")
  redirect("/login/employee")
}

// ─── Forgot/Reset Password (local stubs) ─────────────────────────────────────
/**
 * For the hackathon/dev environment: password reset is handled by an admin
 * directly via the Employee Directory promote/edit flow.
 * These stubs keep the UI compiling without Supabase.
 */
export async function forgotPasswordAction(data: { email: string }) {
  return {
    success: true,
    message:
      "If an account with this email exists, please contact your system administrator to reset your password.",
  }
}

export async function resetPasswordAction(data: { password: string; confirmPassword: string }) {
  return {
    error:
      "Self-service password reset is not available in this environment. Please contact your administrator.",
  }
}

export async function resendConfirmationAction(_email: string) {
  return {
    success: true,
    message: "No email confirmation required in this environment. Try signing in directly.",
  }
}
