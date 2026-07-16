import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  Users2, Package, ShieldCheck, Activity, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, ArrowRightLeft,
  Wrench, Building2, ChevronRight, Plus, BarChart3,
  Circle, Layers,
} from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getAdminKPIs() {
  const [
    totalAssets, availableAssets, allocatedAssets, underMaintenance,
    totalUsers, activeUsers, totalDepts,
    pendingMaintenance, activeCycles, openTransfers,
    recentActivity,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "ALLOCATED" } }),
    prisma.asset.count({ where: { status: "UNDER_MAINTENANCE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.department.count(),
    prisma.maintenanceRequest.count({ where: { status: "PENDING" } }),
    prisma.auditCycle.count({ where: { closed: false } }),
    prisma.allocation.count({ where: { transferStatus: "REQUESTED" } }),
    prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    }),
  ])

  return {
    totalAssets, availableAssets, allocatedAssets, underMaintenance,
    totalUsers, activeUsers, totalDepts,
    pendingMaintenance, activeCycles, openTransfers,
    recentActivity,
    utilizationRate: totalAssets > 0 ? Math.round((allocatedAssets / totalAssets) * 100) : 0,
  }
}

const actionColors: Record<string, string> = {
  ALLOCATE: "text-blue-400 bg-blue-500/10",
  DEALLOCATE: "text-slate-400 bg-slate-700/40",
  MAINTENANCE_REQUEST: "text-amber-400 bg-amber-500/10",
  MAINTENANCE_APPROVE: "text-emerald-400 bg-emerald-500/10",
  MAINTENANCE_RESOLVE: "text-emerald-400 bg-emerald-500/10",
  STATUS_CHANGE: "text-purple-400 bg-purple-500/10",
  AUDIT_CLOSE: "text-red-400 bg-red-500/10",
  BOOK: "text-violet-400 bg-violet-500/10",
}

export async function AdminDashboard({ userName }: { userName: string }) {
  const kpis = await getAdminKPIs()

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Admin Command Center</p>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span style={{ background: "linear-gradient(135deg,#A78BFA,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {userName}
            </span>
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {format(new Date(), "EEEE, MMMM d, yyyy")} · Organization overview
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/org-setup" className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all">
            <Building2 className="w-4 h-4" /> Org Setup
          </Link>
          <Link href="/reports" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold rounded-xl border border-white/[0.08] transition-all">
            <BarChart3 className="w-4 h-4" /> Reports
          </Link>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: kpis.totalAssets, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "from-purple-500/40 via-purple-400/10 to-transparent" },
          { label: "Active Users", value: `${kpis.activeUsers}/${kpis.totalUsers}`, icon: Users2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", accent: "from-blue-500/40 via-blue-400/10 to-transparent" },
          { label: "Departments", value: kpis.totalDepts, icon: Building2, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", accent: "from-cyan-500/40 via-cyan-400/10 to-transparent" },
          { label: "Open Audits", value: kpis.activeCycles, icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", accent: "from-amber-500/40 via-amber-400/10 to-transparent" },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className={`kpi-card relative rounded-2xl border ${k.border} bg-[#111827] p-5 overflow-hidden`}>
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${k.accent}`} />
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${k.bg} blur-2xl opacity-40`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">{k.label}</p>
                  <p className="text-2xl font-bold text-slate-100">{k.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${k.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Asset Health + Attention Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Asset Utilization */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-200">Asset Health</h2>
            <span className="text-xs text-slate-600">{kpis.totalAssets} total</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Available", value: kpis.availableAssets, total: kpis.totalAssets, color: "bg-emerald-500", textColor: "text-emerald-400" },
              { label: "Allocated", value: kpis.allocatedAssets, total: kpis.totalAssets, color: "bg-blue-500", textColor: "text-blue-400" },
              { label: "Under Maintenance", value: kpis.underMaintenance, total: kpis.totalAssets, color: "bg-amber-500", textColor: "text-amber-400" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={item.textColor}>{item.value}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Utilization rate</span>
              <span className="text-sm font-bold text-slate-200">{kpis.utilizationRate}%</span>
            </div>
          </div>
        </div>

        {/* Attention Required */}
        <div className="rounded-2xl border border-amber-500/15 bg-[#111827] overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-500/10 bg-amber-500/5 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-200">Attention Required</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Pending Maintenance", value: kpis.pendingMaintenance, href: "/maintenance", color: "text-amber-400", bg: "bg-amber-500/10", icon: Wrench },
              { label: "Open Transfers", value: kpis.openTransfers, href: "/allocation", color: "text-blue-400", bg: "bg-blue-500/10", icon: ArrowRightLeft },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.label} href={item.href} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-all group">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold text-slate-200">Admin Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Register Asset", href: "/assets/register", icon: Plus, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Manage Employees", href: "/org-setup/employees", icon: Users2, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "View Reports", href: "/reports", icon: BarChart3, color: "text-cyan-400", bg: "bg-cyan-500/10" },
              { label: "Activity Log", href: "/activity", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.06] transition-all group">
                  <div className={`w-7 h-7 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-200">Recent Activity</h2>
          </div>
          <Link href="/activity" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all →</Link>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {kpis.recentActivity.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          ) : (
            kpis.recentActivity.map((log) => {
              const badgeClass = actionColors[log.action] || "text-slate-400 bg-slate-700/40"
              return (
                <div key={log.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${badgeClass}`}>
                    <Circle className="w-2 h-2" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">{log.actor?.name || "System"}</span>
                      {" · "}
                      <span className="text-slate-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                      {" · "}
                      <span className="text-slate-600 text-xs font-mono">{log.entity}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-600 flex-shrink-0">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
