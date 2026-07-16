import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateAuditDialog } from "@/features/audit/components/create-audit-dialog"
import { ShieldCheck, Plus, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function AuditsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)

  let cycles: any[] = []
  if (isAdminOrManager) {
    cycles = await prisma.auditCycle.findMany({
      orderBy: { startDate: "desc" },
      include: { _count: { select: { auditItems: true } } },
    })
  } else {
    cycles = await prisma.auditCycle.findMany({
      where: { auditItems: { some: { auditorId: user.id } } },
      orderBy: { startDate: "desc" },
      include: { _count: { select: { auditItems: true } } },
    })
  }

  let departments: any[] = []
  let users: any[] = []
  if (isAdminOrManager) {
    departments = await prisma.department.findMany({ select: { id: true, name: true } })
    users = await prisma.user.findMany({ select: { id: true, name: true, email: true }, where: { status: "ACTIVE" } })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <span>Dashboard</span><span>/</span><span className="text-slate-400">Audit Cycles</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Audit Cycles</h1>
          <p className="text-sm text-slate-500 mt-1">Physical asset verifications and discrepancy management</p>
        </div>
        {isAdminOrManager && (
          <CreateAuditDialog departments={departments} users={users} />
        )}
      </div>

      {/* Cycles Grid */}
      {cycles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111827] flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">No audit cycles yet</p>
          <p className="text-xs text-slate-600 mt-1 mb-6">Create your first audit cycle to begin asset verification</p>
          {isAdminOrManager && (
            <CreateAuditDialog departments={departments} users={users} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cycles.map((cycle) => (
            <Link
              key={cycle.id}
              href={`/audits/${cycle.id}`}
              className="group block"
            >
              <div className={cn(
                "rounded-2xl border bg-[#111827] p-5 h-full transition-all duration-200",
                "hover:border-white/[0.16] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20",
                cycle.closed
                  ? "border-white/[0.06]"
                  : "border-blue-500/20 shadow-sm shadow-blue-500/5"
              )}>
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    cycle.closed ? "bg-slate-800" : "bg-blue-500/10"
                  )}>
                    {cycle.closed ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
                    cycle.closed
                      ? "bg-slate-800 text-slate-500"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  )}>
                    {cycle.closed ? (
                      <><Lock className="w-2.5 h-2.5" /> Closed</>
                    ) : (
                      <><CheckCircle2 className="w-2.5 h-2.5" /> Active</>
                    )}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Cycle #{cycle.id.slice(-8).toUpperCase()}
                </h3>

                {/* Details */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-slate-600">Period:</span>
                    <span className="text-slate-400">
                      {format(new Date(cycle.startDate), "MMM d")} – {format(new Date(cycle.endDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  {cycle.scopeDeptId && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600">Dept:</span>
                      <span className="text-slate-400">
                        {departments.find((d) => d.id === cycle.scopeDeptId)?.name || cycle.scopeDeptId}
                      </span>
                    </div>
                  )}
                  {cycle.location && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600">Location:</span>
                      <span className="text-slate-400">{cycle.location}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-slate-600">{cycle._count.auditItems} items</span>
                  <span className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">View details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
