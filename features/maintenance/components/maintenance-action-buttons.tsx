"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, X, Play, PenTool, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { updateMaintenanceStatusAction, resolveMaintenanceAction } from "@/actions/maintenance"

export function MaintenanceActionButtons({
  requestId,
  assetId,
  status,
  canManage,
}: {
  requestId: string
  assetId: string
  status: string
  canManage: boolean
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolutionNote, setResolutionNote] = useState("")

  if (!canManage) return null

  async function handleStatusUpdate(newStatus: "APPROVED" | "REJECTED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS") {
    setIsSubmitting(true)
    const result = await updateMaintenanceStatusAction({
      requestId,
      assetId,
      newStatus,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Request ${newStatus.toLowerCase()}.`)
    }
  }

  async function handleResolve() {
    if (!resolutionNote) {
      toast.error("Please enter a resolution note.")
      return
    }

    setIsSubmitting(true)
    const result = await resolveMaintenanceAction({
      requestId,
      assetId,
      resolutionNote,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Maintenance resolved.")
      setResolveOpen(false)
    }
  }

  return (
    <div className="flex gap-2 mt-2">
      {status === "PENDING" && (
        <>
          <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleStatusUpdate("APPROVED")} disabled={isSubmitting}>
            <Check className="mr-1 h-3 w-3"/> Approve
          </Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleStatusUpdate("REJECTED")} disabled={isSubmitting}>
            <X className="mr-1 h-3 w-3"/> Reject
          </Button>
        </>
      )}

      {status === "APPROVED" && (
        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("TECHNICIAN_ASSIGNED")} disabled={isSubmitting}>
          <PenTool className="mr-1 h-3 w-3"/> Assign Tech
        </Button>
      )}

      {status === "TECHNICIAN_ASSIGNED" && (
        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("IN_PROGRESS")} disabled={isSubmitting}>
          <Play className="mr-1 h-3 w-3"/> Start Work
        </Button>
      )}

      {status === "IN_PROGRESS" && (
        <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
          <DialogTrigger render={
            <Button size="sm" variant="default" disabled={isSubmitting}>
              <CheckCircle className="mr-1 h-3 w-3"/> Resolve
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Maintenance</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label>Resolution Note <span className="text-red-500">*</span></Label>
              <Textarea 
                value={resolutionNote} 
                onChange={e => setResolutionNote(e.target.value)} 
                placeholder="What was fixed?" 
                rows={3}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolveOpen(false)}>Cancel</Button>
              <Button onClick={handleResolve} disabled={isSubmitting}>Confirm Resolution</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
