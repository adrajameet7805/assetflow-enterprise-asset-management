"use client"

import Link from "next/link"
import { Search, Plus, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/features/notifications/components/notification-bell"

interface TopNavProps {
  user: {
    dbRole: string
    email?: string | null
    name?: string | null
  }
}

export function TopNav({ user }: TopNavProps) {
  const canRegister = ["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-6 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-md">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search assets, allocations, bookings..."
            className="w-full h-8 pl-9 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="text-[10px] text-slate-600 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {canRegister && (
          <Link href="/assets/register">
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 border-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register Asset</span>
            </Button>
          </Link>
        )}

        <NotificationBell />
      </div>
    </header>
  )
}
