"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { approveTransferAction } from "@/actions/allocation"

export function ApproveTransferButton({
  allocationId,
  assetId,
}: {
  allocationId: string
  assetId: string
}) {
  const [isApproving, setIsApproving] = useState(false)

  async function handleApprove() {
    setIsApproving(true)
    const result = await approveTransferAction(allocationId, assetId)
    setIsApproving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Transfer approved successfully.")
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleApprove} disabled={isApproving}>
      <CheckCircle className="mr-2 h-4 w-4" />
      Approve Transfer
    </Button>
  )
}
