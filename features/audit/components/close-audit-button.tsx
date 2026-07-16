"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Lock } from "lucide-react"

import { closeAuditCycleAction } from "@/actions/audit"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function CloseAuditButton({ cycleId, missingCount }: { cycleId: string, missingCount: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleClose() {
    setIsSubmitting(true)
    const result = await closeAuditCycleAction(cycleId)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Audit cycle closed successfully.")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger 
        render={
          <Button variant="destructive" disabled={isSubmitting}>
            <Lock className="mr-2 h-4 w-4" /> Close Audit Cycle
          </Button>
        } 
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently lock the audit cycle and prevent any further edits.
            {missingCount > 0 && (
              <span className="block mt-2 font-bold text-red-600">
                Warning: {missingCount} missing item(s) will be permanently marked as LOST in the main asset directory.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClose} className="bg-destructive hover:bg-destructive/90">
            Confirm Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
