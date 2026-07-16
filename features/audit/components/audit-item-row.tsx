"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, X, AlertTriangle } from "lucide-react"

import { updateAuditItemStatusAction } from "@/actions/audit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuditItemStatus } from "@prisma/client"

export function AuditItemRow({ 
  item, 
  isClosed, 
  canEdit 
}: { 
  item: any, 
  isClosed: boolean, 
  canEdit: boolean 
}) {
  const [status, setStatus] = useState<AuditItemStatus | null>(item.status)
  const [note, setNote] = useState(item.note || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleStatusChange(newStatus: AuditItemStatus) {
    if (isClosed || !canEdit) return

    setIsSubmitting(true)
    const result = await updateAuditItemStatusAction({
      itemId: item.id,
      cycleId: item.auditCycleId,
      status: newStatus,
      note: note.trim() === "" ? null : note.trim(),
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setStatus(newStatus)
      toast.success(`Marked as ${newStatus}`)
    }
  }

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle">
        <p className="font-medium">{item.asset.tag}</p>
      </td>
      <td className="p-4 align-middle">{item.asset.name}</td>
      <td className="p-4 align-middle">{item.asset.location}</td>
      <td className="p-4 align-middle">
        {isClosed || !canEdit ? (
          <span className="text-sm font-medium">
            {status === "VERIFIED" && <span className="text-green-600">Verified</span>}
            {status === "MISSING" && <span className="text-red-600">Missing</span>}
            {status === "DAMAGED" && <span className="text-orange-600">Damaged</span>}
            {!status && <span className="text-muted-foreground">Unverified</span>}
          </span>
        ) : (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={status === "VERIFIED" ? "default" : "outline"}
              className={status === "VERIFIED" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => handleStatusChange("VERIFIED")}
              disabled={isSubmitting}
            >
              <Check className="mr-1 h-3 w-3"/> Verified
            </Button>
            <Button 
              size="sm" 
              variant={status === "MISSING" ? "default" : "outline"}
              className={status === "MISSING" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => handleStatusChange("MISSING")}
              disabled={isSubmitting}
            >
              <X className="mr-1 h-3 w-3"/> Missing
            </Button>
            <Button 
              size="sm" 
              variant={status === "DAMAGED" ? "default" : "outline"}
              className={status === "DAMAGED" ? "bg-orange-600 hover:bg-orange-700" : ""}
              onClick={() => handleStatusChange("DAMAGED")}
              disabled={isSubmitting}
            >
              <AlertTriangle className="mr-1 h-3 w-3"/> Damaged
            </Button>
          </div>
        )}
      </td>
      <td className="p-4 align-middle">
        <Input 
          placeholder="Optional note" 
          value={note} 
          onChange={e => setNote(e.target.value)}
          onBlur={() => {
            if (status && note !== item.note) {
              handleStatusChange(status) // save note on blur
            }
          }}
          disabled={isClosed || !canEdit || isSubmitting}
          className="h-8 max-w-[200px]"
        />
      </td>
    </tr>
  )
}
