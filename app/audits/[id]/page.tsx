import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditItemRow } from "@/features/audit/components/audit-item-row"
import { CloseAuditButton } from "@/features/audit/components/close-audit-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AuditCyclePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const cycle = await prisma.auditCycle.findUnique({
    where: { id: params.id },
    include: {
      auditItems: {
        include: {
          asset: true,
          auditor: true,
        },
        orderBy: { asset: { tag: 'asc' } }
      }
    }
  })

  if (!cycle) notFound()

  const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)
  const isAuditor = cycle.auditItems.some(i => i.auditorId === user.id)

  if (!isAdminOrManager && !isAuditor) {
    redirect("/audits")
  }

  const missingCount = cycle.auditItems.filter(i => i.status === "MISSING").length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Audit Cycle {cycle.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(cycle.startDate), "MMMM d, yyyy")} — {format(new Date(cycle.endDate), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={cycle.closed ? "secondary" : "default"} className="text-sm px-3 py-1">
            {cycle.closed ? "CLOSED" : "ACTIVE"}
          </Badge>
          {isAdminOrManager && !cycle.closed && (
            <CloseAuditButton cycleId={cycle.id} missingCount={missingCount} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets in Scope</p>
                <p className="text-2xl font-bold">{cycle.auditItems.length}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-xl font-semibold text-green-600">
                    {cycle.auditItems.filter(i => i.status === "VERIFIED").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Missing</p>
                  <p className="text-xl font-semibold text-red-600">
                    {missingCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Damaged</p>
                  <p className="text-xl font-semibold text-orange-600">
                    {cycle.auditItems.filter(i => i.status === "DAMAGED").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-semibold">
                    {cycle.auditItems.filter(i => !i.status).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <div className="rounded-md border border-t-0">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted/20">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tag</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Verification</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {cycle.auditItems.map(item => (
                    <AuditItemRow 
                      key={item.id} 
                      item={item} 
                      isClosed={cycle.closed} 
                      canEdit={item.auditorId === user.id} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
