import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  Package, Users2, Calendar, Wrench, ArrowRightLeft,
  ChevronRight, CheckCircle2, Clock, AlertCircle,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

async function getDeptHeadKPIs(departmentId: string | null) {
  if (!departmentId) {
    return {
      deptName: "Unassigned",
      deptAssets: 0, deptAvailable: 0, deptAllocated: 0,
      deptEmployees: 0, deptBookings: 0, deptMaintenancePending: 0,
      pendingTransfers: 0,
      allocations: [],
      upcomingBookings: [],
    }
  }

  const [
    dept,
    deptAssets, deptAvailable, deptAllocated,
    deptEmployees, deptBookings, deptMaintenancePending,
    pendingTransfers, allocations, upcomingBookings,
  ] = await Promise.all([
    prisma.department.findUnique({ where: { id: departmentId }, select: { name: true } }),
    prisma.asset.count({ where: { departmentId } }),
    prisma.asset.count({ where: { departmentId, status: "AVAILABLE" } }),
    prisma.asset.count({ where: { departmentId, status: "ALLOCATED" } }),
    prisma.user.count({ where: { departmentId, status: "ACTIVE" } }),
    prisma.booking.count({ where: { status: { in: ["UPCOMING", "ONGOING"] }, bookedBy: { departmentId } } }),
    prisma.maintenanceRequest.count({ where: { status: "PENDING", asset: { departmentId } } }),
    prisma.allocation.count({ where: { transferStatus: "REQUESTED", departmentId } }),
    prisma.allocation.findMany({
      where: { returnedAt: null, departmentId },
      take: 6,
      orderBy: { allocatedAt: "desc" },
      include: { asset: { select: { tag: true, name: true, status: true } }, employee: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      where: { status: { in: ["UPCOMING"] }, bookedBy: { departmentId } },
      take: 4,
      orderBy: { startTime: "asc" },
      include: { asset: { select: { name: true, tag: true } }, bookedBy: { select: { name: true } } },
    }),
  ])

  return {
    deptName: dept?.name || "Department",
    deptAssets, deptAvailable, deptAllocated,
    deptEmployees, deptBookings, deptMaintenancePending,
    pendingTransfers, allocations, upcomingBookings,
  }
}

export async function DeptHeadDashboard({ userName, departmentId }: { userName: string; departmentId: string | null }) {
  const kpis = await getDeptHeadKPIs(departmentId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">{kpis.deptName} Department</p>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            Welcome,{" "}
            <span style={{ background: "linear-gradient(135deg,#22D3EE,#0891B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {userName}
            </span>
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">{format(new Date(), "EEEE, MMMM d")} · Department overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/booking" className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
            <Calendar className="w-4 h-4" /> New Booking
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Dept Assets", value: kpis.deptAssets, sub: `${kpis.deptAvailable} available`, icon: Package, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", top: "from-cyan-500/50" },
          { label: "Team Members", value: kpis.deptEmployees, sub: "active employees", icon: Users2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", top: "from-blue-500/50" },
          { label: "Active Bookings", value: kpis.deptBookings, sub: "upcoming & ongoing", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", top: "from-purple-500/50" },
          { label: "Pending Items", value: kpis.deptMaintenancePending + kpis.pendingTransfers, sub: `${kpis.pendingTransfers} transfers`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", top: "from-amber-500/50" },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className={`kpi-card relative rounded-2xl border ${k.border} bg-[#111827] p-5 overflow-hidden`}>
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${k.top} via-transparent to-transparent`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${k.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100 mb-0.5">{k.value}</p>
              <p className="text-xs font-medium text-slate-500">{k.label}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{k.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Allocations — wide */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200">Dept Allocations</h2>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-500">{kpis.allocations.length}</span>
            </div>
            <Link href="/allocation" className="text-xs text-cyan-400 hover:text-cyan-300">View all →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {kpis.allocations.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No active allocations</p>
              </div>
            ) : (
              kpis.allocations.map((alloc) => (
                <div key={alloc.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{alloc.asset?.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{alloc.employee?.name} · {alloc.asset?.tag}</p>
                  </div>
                  {alloc.expectedReturnDate && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] text-slate-400">{format(new Date(alloc.expectedReturnDate), "MMM d")}</p>
                      <p className="text-[10px] text-slate-600">{formatDistanceToNow(new Date(alloc.expectedReturnDate), { addSuffix: true })}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upcoming bookings */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-200">Upcoming Bookings</h2>
              </div>
              <Link href="/booking" className="text-xs text-purple-400 hover:text-purple-300">View →</Link>
            </div>
            <div className="p-4 space-y-2">
              {kpis.upcomingBookings.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No upcoming bookings</p>
                </div>
              ) : (
                kpis.upcomingBookings.map((bk) => (
                  <div key={bk.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                    <p className="text-sm font-medium text-slate-200 truncate">{bk.asset?.name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{bk.bookedBy?.name} · {format(new Date(bk.startTime), "MMM d, HH:mm")}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 px-1">Quick Actions</p>
            {[
              { label: "View Dept Assets", href: "/assets", icon: Package, color: "text-cyan-400", bg: "bg-cyan-500/10" },
              { label: "Manage Bookings", href: "/booking", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Transfer Requests", href: "/allocation", icon: ArrowRightLeft, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Maintenance", href: "/maintenance", icon: Wrench, color: "text-amber-400", bg: "bg-amber-500/10" },
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
