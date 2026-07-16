import Link from "next/link"
import { format, formatDistanceToNow, isPast } from "date-fns"
import {
  Package, Calendar, Wrench, Bell, ChevronRight,
  Plus, Clock, CheckCircle2, AlertTriangle, ArrowRight,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

async function getEmployeeData(userId: string) {
  const [
    myAllocations, myBookings, myMaintenanceRequests, myNotifications,
  ] = await Promise.all([
    prisma.allocation.findMany({
      where: { employeeId: userId, returnedAt: null },
      include: { asset: { select: { id: true, tag: true, name: true, status: true, category: { select: { name: true } } } } },
      orderBy: { allocatedAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { bookedById: userId, status: { in: ["UPCOMING", "ONGOING"] } },
      include: { asset: { select: { name: true, tag: true } } },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    prisma.maintenanceRequest.findMany({
      where: { raisedById: userId },
      include: { asset: { select: { name: true, tag: true } } },
      orderBy: { id: "desc" },
      take: 4,
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const overdueAllocations = myAllocations.filter(
    (a) => a.expectedReturnDate && isPast(new Date(a.expectedReturnDate))
  )

  return { myAllocations, myBookings, myMaintenanceRequests, myNotifications, overdueAllocations }
}

const maintenanceStatusConfig: Record<string, { label: string; cls: string }> = {
  PENDING:             { label: "Pending",             cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  APPROVED:            { label: "Approved",            cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  REJECTED:            { label: "Rejected",            cls: "text-red-400 bg-red-500/10 border-red-500/20" },
  TECHNICIAN_ASSIGNED: { label: "Assigned",            cls: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  IN_PROGRESS:         { label: "In Progress",         cls: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  RESOLVED:            { label: "Resolved",            cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
}

const bookingStatusConfig: Record<string, { label: string; cls: string }> = {
  UPCOMING: { label: "Upcoming", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  ONGOING:  { label: "Ongoing",  cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
}

export async function EmployeeDashboard({ userName, userId }: { userName: string; userId: string }) {
  const data = await getEmployeeData(userId)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">My Workspace</p>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            {greeting},{" "}
            <span style={{ background: "linear-gradient(135deg,#34D399,#059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {userName}
            </span>
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {format(new Date(), "EEEE, MMMM d")} · {data.myAllocations.length} assets assigned to you
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/booking" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
            <Calendar className="w-4 h-4" /> Book Resource
          </Link>
          <Link href="/maintenance" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold rounded-xl border border-white/[0.08] transition-all">
            <Wrench className="w-4 h-4" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Overdue Alert */}
      {data.overdueAllocations.length > 0 && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-300 mb-1">
              {data.overdueAllocations.length} overdue return{data.overdueAllocations.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-500">
              {data.overdueAllocations.map(a => a.asset?.name).join(", ")} — please return or request an extension.
            </p>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Assets", value: data.myAllocations.length, sub: `${data.overdueAllocations.length} overdue`, icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", top: "from-emerald-500/50" },
          { label: "Bookings", value: data.myBookings.length, sub: "upcoming & ongoing", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", top: "from-blue-500/50" },
          { label: "Maintenance", value: data.myMaintenanceRequests.length, sub: "all time requests", icon: Wrench, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", top: "from-amber-500/50" },
          { label: "Notifications", value: data.myNotifications.length, sub: "unread", icon: Bell, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", top: "from-purple-500/50" },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className={`kpi-card relative rounded-2xl border ${k.border} bg-[#111827] p-5 overflow-hidden`}>
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${k.top} via-transparent to-transparent`} />
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${k.color}`} />
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
        {/* My Assets */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200">My Assets</h2>
            </div>
            <Link href="/assets" className="text-xs text-emerald-400 hover:text-emerald-300">View all →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data.myAllocations.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Package className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-400">No assets assigned to you</p>
                <p className="text-xs text-slate-600 mt-1">Contact your Asset Manager to request one</p>
              </div>
            ) : (
              data.myAllocations.map((alloc) => {
                const isOverdue = alloc.expectedReturnDate && isPast(new Date(alloc.expectedReturnDate))
                return (
                  <div key={alloc.id} className={cn("flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors", isOverdue && "bg-red-500/[0.04]")}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isOverdue ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20")}>
                      <Package className={cn("w-3.5 h-3.5", isOverdue ? "text-red-400" : "text-emerald-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{alloc.asset?.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-mono">{alloc.asset?.tag} · {alloc.asset?.category?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {alloc.expectedReturnDate ? (
                        <>
                          <p className={cn("text-[11px] font-medium", isOverdue ? "text-red-400" : "text-slate-400")}>
                            {format(new Date(alloc.expectedReturnDate), "MMM d, yyyy")}
                          </p>
                          <p className={cn("text-[10px] mt-0.5", isOverdue ? "text-red-500/70" : "text-slate-600")}>
                            {isOverdue ? "OVERDUE" : `due ${formatDistanceToNow(new Date(alloc.expectedReturnDate), { addSuffix: true })}`}
                          </p>
                        </>
                      ) : (
                        <p className="text-[11px] text-slate-600">No return date</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upcoming bookings */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-slate-200">My Bookings</h2>
              </div>
              <Link href="/booking" className="text-xs text-blue-400 hover:text-blue-300">Manage →</Link>
            </div>
            <div className="p-4 space-y-2">
              {data.myBookings.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-slate-500 mb-3">No upcoming bookings</p>
                  <Link href="/booking" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Book a resource
                  </Link>
                </div>
              ) : (
                data.myBookings.map((bk) => {
                  const sc = bookingStatusConfig[bk.status] || { label: bk.status, cls: "" }
                  return (
                    <div key={bk.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-200 truncate">{bk.asset?.name}</p>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0", sc.cls)}>{sc.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {format(new Date(bk.startTime), "MMM d, HH:mm")} → {format(new Date(bk.endTime), "HH:mm")}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Maintenance requests */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-slate-200">My Requests</h2>
              </div>
              <Link href="/maintenance" className="text-xs text-amber-400 hover:text-amber-300">View →</Link>
            </div>
            <div className="p-4 space-y-2">
              {data.myMaintenanceRequests.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No maintenance requests</p>
                </div>
              ) : (
                data.myMaintenanceRequests.map((req) => {
                  const sc = maintenanceStatusConfig[req.status] || { label: req.status, cls: "" }
                  return (
                    <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{req.asset?.name}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{req.asset?.tag}</p>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0", sc.cls)}>{sc.label}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
