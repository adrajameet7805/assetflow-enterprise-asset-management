import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LandingPage } from "@/components/landing/landing-page"

export default async function HomePage() {
  const user = await getCurrentUser()

  // Not logged in → public landing page
  if (!user) {
    return <LandingPage />
  }

  // Redirect to correct dashboard based on role
  switch (user.role) {
    case "ADMIN":
      redirect("/dashboard/admin")
    case "ASSET_MANAGER":
      redirect("/dashboard/asset-manager")
    case "DEPARTMENT_HEAD":
      redirect("/dashboard/department-head")
    case "EMPLOYEE":
    default:
      redirect("/dashboard/employee")
  }
}
