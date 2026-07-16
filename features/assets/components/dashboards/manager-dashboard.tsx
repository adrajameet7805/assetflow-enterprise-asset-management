import Link from "next/link"
import { format } from "date-fns"
import {
  Package, ArrowRightLeft, Wrench, Calendar, Plus,
  ChevronRight, TrendingUp, Clock, AlertCircle, CheckCircle2,
  ScanLine, ClipboardList, Circle,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

async function getManagerKPIs() {
  const [
    totalAssets, available, allocated, underMaintenance,
    pendingMaintenance, approvedMaintenance, pendingTransfers,
    activeBookings, recentAssets, pendingMaintenanceList,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "ALLOCATED" } }),
    prisma.asset.count({ where: { status: "UNDER_MAINTENANCE" } }),
    prisma.maintenanceRequest.count({ where: { status: "PENDING" } }),
    prisma.maintenanceRequest.count({ where: { status: "APPROVED" } }),
    prisma.allocation.count({ where: { transferStatus: "REQUESTED" } }),
    prisma.booking.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
    prisma.asset.findMany({
      take: 6,
      orderBy: { id: "desc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.maintenanceRequest.findMany({
      where: { status: { in: ["PENDING", "APPROVED"] } },
      take: 5,
      orderBy: { id: "desc" },
      include: { asset: { select: { tag: true, name: true } }, raisedBy: { select: { name: true } } },
    }),
  ])

  return {
    totalAssets, available, allocated, underMaintenance,
    pendingMaintenance, approvedMaintenance, pendingTransfers,
    activeBookings, recentAssets, pendingMaintenanceList,
  }
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  AVAILABLE:         { label: "Available",    cls: "status-available" },
  ALLOCATED:         { label: "Allocated",    cls: "status-allocated" },
  RESERVED:          { label: "Reserved",     cls: "status-reserved" },
  UNDER_MAINTENANCE: { label: "Maintenance",  cls: "status-under_maintenance" },
  LOST:              { label: "Lost",         cls: "status-lost" },
  RETIRED:           { label: "Retired",      cls: "status-retired" },
  DISPOSED:          { label: "Disposed",     cls: "status-disposed" },
}

const maintenanceStatus: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "Pending",  color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
}

export async function ManagerDashboard({ userName }: { userName: string }) {
  const kpis = await getManagerKPIs()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Asset Operations</p>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"},{" "}
            <span style={{ background: "linear-gradient(135deg,#60A5FA,#2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {userName}
            </span>
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">{format(new Date(), "EEEE, MMMM d")} · Inventory & allocation overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/assets/register" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
            <Plus className="w-4 h-4" /> Register Asset
          </Link>
          <Link href="/allocation" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold rounded-xl border border-white/[0.08] transition-all">
            <ArrowRightLeft className="w-4 h-4" /> Allocate
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: kpis.totalAssets, sub: `${kpis.available} available`, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", accent: "from-blue-500/50" },
          { label: "Allocated", value: kpis.allocated, sub: `${kpis.underMaintenance} in maintenance`, icon: ArrowRightLeft, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "from-purple-500/50" },
          { label: "Pending Approval", value: kpis.pendingMaintenance + kpis.pendingTransfers, sub: `${kpis.pendingTransfers} transfers`, icon: ClipboardList, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", accent: "from-amber-500/50" },
          { label: "Active Bookings", value: kpis.activeBookings, sub: "upcoming & ongoing", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", accent: "from-cyan-500/50" },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className={`kpi-card relative rounded-2xl border ${k.border} bg-[#111827] p-5 overflow-hidden`}>
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${k.accent} via-transparent to-transparent`} />
              <div className="flex items-start justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${k.color}`} />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
              </div>
              <p className="text-2xl font-bold text-slate-100 mb-0.5">{k.value}</p>
              <p className="text-xs font-medium text-slate-500">{k.label}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{k.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Assets — wide */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-slate-200">Recently Added</h2>
            </div>
            <Link href="/assets" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {kpis.recentAssets.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No assets registered yet</p>
              </div>
            ) : (
              kpis.recentAssets.map((asset) => {
                const sc = statusConfig[asset.status] || { label: asset.status, cls: "status-available" }
                return (
                  <div key={asset.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Package className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/assets/${asset.id}`} className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors block truncate">
                        {asset.name}
                      </Link>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">{asset.tag} · {asset.category?.name}</p>
                    </div>
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg", sc.cls)}>{sc.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending Maintenance */}
          <div className="rounded-2xl border border-amber-500/15 bg-[#111827] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/10 bg-amber-500/[0.04]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-slate-200">Maintenance Queue</h2>
                {kpis.pendingMaintenance > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {kpis.pendingMaintenance}
                  </span>
                )}
              </div>
              <Link href="/maintenance" className="text-xs text-amber-400 hover:text-amber-300">Manage →</Link>
            </div>
            <div className="p-4 space-y-2">
              {kpis.pendingMaintenanceList.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">All clear!</p>
                </div>
              ) : (
                kpis.pendingMaintenanceList.map((req) => {
                  const sc = maintenanceStatus[req.status] || { label: req.status, color: "text-slate-400 bg-slate-700/40 border-slate-600/20" }
                  return (
                    <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                      <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{req.asset?.name}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{req.raisedBy?.name} · {req.asset?.tag}</p>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0", sc.color)}>
                        {sc.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 px-1">Quick Actions</p>
            {[
              { label: "Register New Asset", href: "/assets/register", icon: Plus, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Approve Transfers", href: "/allocation", icon: ArrowRightLeft, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Booking Calendar", href: "/booking", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            ].map((a) => {
              const Icon = a.icon
              return (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.06] transition-all group">
                  <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${a.color}`} />
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{a.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
