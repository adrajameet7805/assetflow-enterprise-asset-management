"use client"

import { useState } from "react"
import { Department, User } from "@prisma/client"
import { toast } from "sonner"
import { CalendarIcon, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { allocateAction, requestTransferAction } from "@/actions/allocation"

export function AllocationDialog({
  assetId,
  users,
  departments,
}: {
  assetId: string
  users: User[]
  departments: Department[]
}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [targetType, setTargetType] = useState<"EMPLOYEE" | "DEPARTMENT">("EMPLOYEE")
  const [targetId, setTargetId] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")

  const [conflictState, setConflictState] = useState<{
    holderName: string
    allocationId: string
  } | null>(null)

  async function handleAllocate() {
    if (!targetId) {
      toast.error("Please select an assignee.")
      return
    }

    setIsSubmitting(true)
    const result = await allocateAction({
      assetId,
      targetType,
      targetId,
      expectedReturnDate: expectedReturnDate || null,
    })
    setIsSubmitting(false)

    if (result.conflict) {
      setConflictState({ holderName: result.holderName!, allocationId: result.allocationId! })
    } else if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Asset allocated successfully.")
      resetAndClose()
    }
  }

  async function handleRequestTransfer() {
    if (!conflictState) return
    setIsSubmitting(true)
    const result = await requestTransferAction({
      assetId,
      allocationId: conflictState.allocationId,
      targetType,
      targetId,
      expectedReturnDate: expectedReturnDate || null,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Transfer requested successfully.")
      resetAndClose()
    }
  }

  function resetAndClose() {
    setOpen(false)
    setTimeout(() => {
      setTargetType("EMPLOYEE")
      setTargetId("")
      setExpectedReturnDate("")
      setConflictState(null)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) resetAndClose(); else setOpen(true) }}>
      <DialogTrigger render={<Button>Allocate Asset</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Asset</DialogTitle>
        </DialogHeader>

        {conflictState ? (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Allocation Conflict</AlertTitle>
              <AlertDescription>
                This asset is currently held by <strong>{conflictState.holderName}</strong>. 
                You cannot allocate it directly, but you can request a transfer.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Allocation Type</Label>
              <Select value={targetType} onValueChange={(val: "EMPLOYEE" | "DEPARTMENT" | null) => {
                if (val) {
                  setTargetType(val)
                  setTargetId("")
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Assign to Employee</SelectItem>
                  <SelectItem value="DEPARTMENT">Assign to Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={targetId} onValueChange={(val: string | null) => val && setTargetId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  {targetType === "EMPLOYEE" ? (
                    users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)
                  ) : (
                    departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expected Return Date (Optional)</Label>
              <Input type="date" value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={isSubmitting}>Cancel</Button>
          {conflictState ? (
            <Button onClick={handleRequestTransfer} disabled={isSubmitting}>Request Transfer</Button>
          ) : (
            <Button onClick={handleAllocate} disabled={isSubmitting}>Allocate</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
