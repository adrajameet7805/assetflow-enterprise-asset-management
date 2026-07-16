"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Package, Users2, Calendar, Wrench, ShieldCheck,
  BarChart3, Activity, LogOut, Zap, ChevronRight, Building2,
  ArrowRightLeft, ClipboardList, Bell, ScanLine, Layers,
  UserCircle, BookOpen, FileText, Settings, GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface RoleConfig {
  cssClass: string
  activeClass: string
  logoClass: string
  badgeClass: string
  badgeLabel: string
  gradientFrom: string
  gradientTo: string
  navGroups: NavGroup[]
}

function getRoleConfig(dbRole: string): RoleConfig {
  switch (dbRole) {
    case "ADMIN":
      return {
        cssClass: "role-admin",
        activeClass: "bg-purple-500/12 text-purple-300 border border-purple-500/25",
        logoClass: "bg-purple-600 shadow-lg shadow-purple-500/30",
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        badgeLabel: "Super Admin",
        gradientFrom: "from-purple-600",
        gradientTo: "to-violet-700",
        navGroups: [
          {
            label: "OVERVIEW",
            items: [
              { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
            ],
          },
          {
            label: "ORGANIZATION",
            items: [
              { href: "/org-setup", label: "Organization", icon: Building2 },
              { href: "/org-setup/employees", label: "Employees", icon: Users2 },
            ],
          },
          {
            label: "ASSETS",
            items: [
              { href: "/assets", label: "Assets", icon: Package },
              { href: "/allocation", label: "Allocation", icon: ArrowRightLeft },
              { href: "/booking", label: "Bookings", icon: Calendar },
              { href: "/maintenance", label: "Maintenance", icon: Wrench },
              { href: "/audits", label: "Audit Cycles", icon: ShieldCheck },
            ],
          },
          {
            label: "INSIGHTS",
            items: [
              { href: "/reports", label: "Reports", icon: BarChart3 },
              { href: "/activity", label: "Activity Log", icon: Activity },
            ],
          },
        ],
      }

    case "ASSET_MANAGER":
      return {
        cssClass: "role-manager",
        activeClass: "bg-blue-500/12 text-blue-300 border border-blue-500/25",
        logoClass: "bg-blue-600 shadow-lg shadow-blue-500/30",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        badgeLabel: "Asset Manager",
        gradientFrom: "from-blue-600",
        gradientTo: "to-indigo-700",
        navGroups: [
          {
            label: "OVERVIEW",
            items: [
              { href: "/dashboard/asset-manager", label: "Dashboard", icon: LayoutDashboard, exact: true },
            ],
          },
          {
            label: "ASSET OPS",
            items: [
              { href: "/assets", label: "Assets", icon: Package },
              { href: "/assets/register", label: "Register Asset", icon: GitBranch },
              { href: "/allocation", label: "Allocation", icon: ArrowRightLeft },
              { href: "/maintenance", label: "Maintenance", icon: Wrench },
            ],
          },
          {
            label: "RESOURCES",
            items: [
              { href: "/booking", label: "Bookings", icon: Calendar },
              { href: "/audits", label: "Audits", icon: ShieldCheck },
            ],
          },
          {
            label: "ANALYTICS",
            items: [
              { href: "/reports", label: "Reports", icon: BarChart3 },
            ],
          },
        ],
      }

    case "DEPARTMENT_HEAD":
      return {
        cssClass: "role-head",
        activeClass: "bg-cyan-500/12 text-cyan-300 border border-cyan-500/25",
        logoClass: "bg-cyan-600 shadow-lg shadow-cyan-500/30",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        badgeLabel: "Dept Head",
        gradientFrom: "from-cyan-600",
        gradientTo: "to-sky-700",
        navGroups: [
          {
            label: "OVERVIEW",
            items: [
              { href: "/dashboard/department-head", label: "Dashboard", icon: LayoutDashboard, exact: true },
            ],
          },
          {
            label: "MY DEPARTMENT",
            items: [
              { href: "/assets", label: "Dept Assets", icon: Package },
              { href: "/booking", label: "Bookings", icon: Calendar },
              { href: "/maintenance", label: "Maintenance", icon: Wrench },
            ],
          },
          {
            label: "WORKFLOW",
            items: [
              { href: "/allocation", label: "Transfers", icon: ArrowRightLeft },
              { href: "/audits", label: "Audits", icon: ShieldCheck },
            ],
          },
        ],
      }

    default: // EMPLOYEE
      return {
        cssClass: "role-employee",
        activeClass: "bg-emerald-500/12 text-emerald-300 border border-emerald-500/25",
        logoClass: "bg-emerald-600 shadow-lg shadow-emerald-500/30",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        badgeLabel: "Employee",
        gradientFrom: "from-emerald-600",
        gradientTo: "to-teal-700",
        navGroups: [
          {
            label: "MY WORKSPACE",
            items: [
              { href: "/dashboard/employee", label: "Dashboard", icon: LayoutDashboard, exact: true },
            ],
          },
          {
            label: "ASSETS & BOOKINGS",
            items: [
              { href: "/assets", label: "My Assets", icon: Package },
              { href: "/booking", label: "Book Resource", icon: Calendar },
              { href: "/maintenance", label: "Maintenance", icon: Wrench },
            ],
          },
          {
            label: "ACCOUNT",
            items: [
              { href: "/audits", label: "My Audits", icon: ShieldCheck },
            ],
          },
        ],
      }
  }
}

interface SidebarProps {
  dbRole: string
  userEmail: string
  userName?: string | null
}

export function Sidebar({ dbRole, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const config = getRoleConfig(dbRole)

  async function handleSignOut() {
    await signOutAction()
    router.push("/login")
    router.refresh()
  }

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase()

  const displayName = userName || userEmail.split("@")[0]

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/[0.06] bg-[#0F172A]", config.cssClass)}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className={cn("logo-mark flex items-center justify-center w-8 h-8 rounded-lg", config.logoClass)}>
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[15px] font-bold text-white tracking-tight">AssetFlow</span>
          <div className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Enterprise</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {config.navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-semibold text-slate-600 tracking-widest">{group.label}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "nav-item group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? cn("nav-active", config.activeClass)
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "" : "text-slate-500 group-hover:text-slate-300")} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className={cn("text-white text-xs font-bold bg-gradient-to-br", config.gradientFrom, config.gradientTo)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">{displayName}</div>
            <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 mt-0.5 border font-medium", config.badgeClass)}>
              {config.badgeLabel}
            </Badge>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
