import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { EmployeeDashboard } from "@/features/assets/components/dashboards/employee-dashboard"

export default async function EmployeeDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const userName = (user.user_metadata?.name as string | undefined)?.split(" ")[0] || (user.email ?? "Employee").split("@")[0]
  return <EmployeeDashboard userName={userName} userId={user.dbId} />
}
