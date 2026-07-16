import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminDashboard } from "@/features/assets/components/dashboards/admin-dashboard"
import { PermissionDenied } from "@/components/ui/permission-denied"

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.dbRole !== "ADMIN") return <PermissionDenied />
  const userName = (user.user_metadata?.name as string | undefined)?.split(" ")[0] || (user.email ?? "Admin").split("@")[0]
  return <AdminDashboard userName={userName} />
}
