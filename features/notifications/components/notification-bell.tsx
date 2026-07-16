"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getNotificationsAction, markNotificationAsReadAction } from "@/actions/notifications"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    async function fetchNotifications() {
      const result = await getNotificationsAction()
      if (result.data) setNotifications(result.data)
    }
    fetchNotifications()
    // In a real app we might poll this, but for hackathon, fetch on mount and popover open is fine
  }, [])

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      const result = await getNotificationsAction()
      if (result.data) setNotifications(result.data)
    }
  }

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await markNotificationAsReadAction(id)
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No notifications yet.</p>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                className={cn("p-4 border-b last:border-0 text-sm cursor-pointer transition-colors hover:bg-muted/50", !n.read && "bg-muted/30")}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn("font-medium", !n.read && "text-primary")}>{n.type}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1"></span>}
                </div>
                <p className="text-muted-foreground text-xs">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
