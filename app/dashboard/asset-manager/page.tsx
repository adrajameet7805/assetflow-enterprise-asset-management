import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { ManagerDashboard } from "@/features/assets/components/dashboards/manager-dashboard"
import { PermissionDenied } from "@/components/ui/permission-denied"

export default async function AssetManagerDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.dbRole !== "ASSET_MANAGER") return <PermissionDenied />
  const userName = (user.user_metadata?.name as string | undefined)?.split(" ")[0] || (user.email ?? "Manager").split("@")[0]
  return <ManagerDashboard userName={userName} />
}
