"use client"

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { toast } from "sonner"
import { XCircle, RefreshCw } from "lucide-react"

import { cancelBookingAction } from "@/actions/booking"
import { Button } from "@/components/ui/button"

type BookingWithUser = {
  id: string
  startTime: Date
  endTime: Date
  status: string
  bookedBy: { id: string; name: string }
}

export function BookingCalendar({
  assetId,
  bookings,
  currentUserId,
}: {
  assetId: string
  bookings: BookingWithUser[]
  currentUserId?: string
}) {
  const [isCancelling, setIsCancelling] = useState<string | null>(null)

  const upcomingBookings = bookings
    .filter(b => b.status === "UPCOMING" || b.status === "ONGOING")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Group by day for a clean timeline view
  const groupedBookings: { [key: string]: BookingWithUser[] } = {}
  upcomingBookings.forEach(b => {
    const day = format(new Date(b.startTime), "yyyy-MM-dd")
    if (!groupedBookings[day]) groupedBookings[day] = []
    groupedBookings[day].push(b)
  })

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    
    setIsCancelling(bookingId)
    const result = await cancelBookingAction(bookingId, assetId)
    setIsCancelling(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Booking cancelled.")
    }
  }

  if (upcomingBookings.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/20">
        No upcoming bookings for this resource.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedBookings).map(([day, dayBookings]) => (
        <div key={day} className="space-y-2">
          <h4 className="font-semibold text-sm bg-muted py-1 px-3 rounded-md">
            {format(new Date(day + "T12:00:00"), "EEEE, MMMM d, yyyy")}
          </h4>
          <div className="space-y-2 pl-2">
            {dayBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm border-l-4 border-blue-500 pl-3 py-2 bg-card rounded shadow-sm">
                <div>
                  <p className="font-medium">
                    {format(new Date(b.startTime), "h:mm a")} - {format(new Date(b.endTime), "h:mm a")}
                  </p>
                  <p className="text-muted-foreground text-xs">Booked by: {b.bookedBy.name}</p>
                </div>
                {b.bookedBy.id === currentUserId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive h-8 px-2"
                    onClick={() => handleCancel(b.id)}
                    disabled={isCancelling === b.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
