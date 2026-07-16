"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { returnAllocationAction } from "@/actions/allocation"

export function ReturnDialog({
  assetId,
  allocationId,
}: {
  assetId: string
  allocationId: string
}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conditionOnReturn, setConditionOnReturn] = useState("")

  async function handleReturn() {
    if (!conditionOnReturn) {
      toast.error("Please provide return condition notes.")
      return
    }

    setIsSubmitting(true)
    const result = await returnAllocationAction({
      assetId,
      allocationId,
      conditionOnReturn,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Asset returned successfully.")
      setOpen(false)
      setConditionOnReturn("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Return Asset</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Condition Check-in Notes <span className="text-red-500">*</span></Label>
            <Input 
              value={conditionOnReturn} 
              onChange={e => setConditionOnReturn(e.target.value)} 
              placeholder="e.g. Good condition, small scratch on side" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleReturn} disabled={isSubmitting}>Confirm Return</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
