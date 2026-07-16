import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getAnalyticsReports } from "@/services/dashboard.service"
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard"
import { BarChart3 } from "lucide-react"

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (!["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    redirect("/")
  }

  const data = await getAnalyticsReports(user)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
          <span>Dashboard</span><span>/</span><span className="text-slate-400">Reports</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Exportable insights into asset utilization and maintenance.</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
        </div>
      </div>

      <ReportsDashboard
        deptAllocations={data.deptAllocations}
        statusDistribution={data.statusDistribution}
        maintenanceFreq={data.maintenanceFreq}
      />
    </div>
  )
}
