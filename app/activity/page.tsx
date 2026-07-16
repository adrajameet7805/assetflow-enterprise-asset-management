import { redirect } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Activity, User } from "lucide-react"

const actionColors: Record<string, string> = {
  ALLOCATE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DEALLOCATE: "bg-slate-700/60 text-slate-400 border-slate-600/30",
  TRANSFER: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MAINTENANCE_REQUEST: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MAINTENANCE_APPROVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MAINTENANCE_RESOLVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  STATUS_CHANGE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  AUDIT_CLOSE: "bg-red-500/10 text-red-400 border-red-500/20",
  BOOK: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  CANCEL_BOOKING: "bg-slate-700/60 text-slate-400 border-slate-600/30",
}

export default async function ActivityLogPage() {
  const user = await getCurrentUser()
  if (!user || user.dbRole !== "ADMIN") redirect("/")

  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
          <span>Dashboard</span><span>/</span><span className="text-slate-400">Activity Log</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Activity Log</h1>
            <p className="text-sm text-slate-500 mt-1">Complete audit trail of all system actions — last 100 events</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[180px_220px_160px_160px_1fr] gap-4 px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          {["Timestamp", "Actor", "Action", "Entity", "Details"].map((col) => (
            <div key={col} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{col}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-400">No activity recorded</p>
              <p className="text-xs text-slate-600 mt-1">System actions will appear here</p>
            </div>
          ) : (
            activities.map((log) => {
              const badgeClass = actionColors[log.action] || "bg-slate-700/60 text-slate-400 border-slate-600/30"
              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[180px_220px_160px_160px_1fr] gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-300 whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {log.actor?.name || "System"}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate">{log.actor?.email}</div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeClass}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-300">{log.entity}</div>
                    <div className="text-[10px] text-slate-600 font-mono truncate max-w-[120px]" title={log.entityId}>
                      {log.entityId.slice(-12)}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 truncate">
                    {log.metadata ? JSON.stringify(log.metadata).slice(0, 120) : "{}"}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
