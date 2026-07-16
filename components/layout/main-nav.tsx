"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Home, Box, Wrench, ShieldCheck, Settings, Activity, BarChart3, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/features/notifications/components/notification-bell"

export function MainNav({ dbRole }: { dbRole: string }) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(dbRole)
  const isAdmin = dbRole === "ADMIN"

  const routes = [
    { href: "/", label: "Dashboard", icon: Home, show: true },
    { href: "/assets", label: "Assets", icon: Box, show: true },
    { href: "/audits", label: "Audits", icon: ShieldCheck, show: true },
    { href: "/reports", label: "Reports", icon: BarChart3, show: isAdminOrManager },
    { href: "/activity", label: "Activity Log", icon: Activity, show: isAdmin },
    { href: "/org-setup", label: "Org Setup", icon: Settings, show: isAdmin },
  ].filter(r => r.show)

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto w-full gap-6">
        <div className="flex items-center gap-2 mr-6 font-bold text-lg tracking-tight">
          <Wrench className="h-5 w-5 text-primary" />
          <span>AssetFlow</span>
        </div>
        
        <div className="flex-1 flex items-center space-x-1">
          {routes.map((route) => {
            const Icon = route.icon
            const active = pathname === route.href || (route.href !== "/" && pathname.startsWith(route.href))
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                  active ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
