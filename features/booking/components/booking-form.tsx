"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format, isAfter, isBefore } from "date-fns"
import { CalendarIcon } from "lucide-react"

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

import { bookAssetAction } from "@/actions/booking"

export function BookingForm({ assetId }: { assetId: string }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("10:00")

  async function handleBook() {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please fill in all date and time fields.")
      return
    }

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    if (start >= end) {
      toast.error("End time must be after start time.")
      return
    }

    setIsSubmitting(true)
    const result = await bookAssetAction({
      assetId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    })
    setIsSubmitting(false)

    if (result.overlap) {
      toast.error("Time slot unavailable. The asset is already booked for this period.")
    } else if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Asset booked successfully.")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><CalendarIcon className="mr-2 h-4 w-4"/> Book Resource</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Resource</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleBook} disabled={isSubmitting}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
