import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DeptHeadDashboard } from "@/features/assets/components/dashboards/dept-head-dashboard"
import { PermissionDenied } from "@/components/ui/permission-denied"

export default async function DeptHeadDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.dbRole !== "DEPARTMENT_HEAD") return <PermissionDenied />
  const userName = (user.user_metadata?.name as string | undefined)?.split(" ")[0] || (user.email ?? "Head").split("@")[0]
  return <DeptHeadDashboard userName={userName} departmentId={user.departmentId ?? null} />
}
