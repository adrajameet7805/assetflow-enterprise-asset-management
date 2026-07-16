import Link from "next/link"
import { Zap, Package, ArrowRightLeft, Wrench, ShieldCheck, BarChart3, ChevronRight, Users, Building2, CheckCircle2 } from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Asset Lifecycle Management",
    desc: "Track every asset from registration to retirement with full history and audit trail.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: ArrowRightLeft,
    title: "Smart Allocation Engine",
    desc: "Conflict-free allocation with real-time overlap detection and transfer workflows.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Wrench,
    title: "Maintenance Workflows",
    desc: "End-to-end maintenance lifecycle: raise, approve, assign, resolve — with status gating.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Audit Cycle Management",
    desc: "Structured audit cycles with auditor assignment, discrepancy reporting, and atomic closure.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Utilization trends, maintenance frequency, booking heatmaps — all exportable to CSV.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    desc: "Admin, Asset Manager, Department Head, Employee — each with a tailored experience.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
]

const roles = [
  {
    role: "Admin",
    desc: "Full system control. Manage org, promote users, close audits, view all analytics.",
    accent: "from-purple-600 to-violet-700",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/20",
    loginHref: "/login/admin",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    role: "Asset Manager",
    desc: "Register and allocate assets, approve maintenance and transfers, run inventory.",
    accent: "from-blue-600 to-indigo-700",
    glow: "shadow-blue-500/20",
    border: "border-blue-500/20",
    loginHref: "/login",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    role: "Department Head",
    desc: "Oversee department assets and team, approve requests, manage bookings.",
    accent: "from-cyan-600 to-sky-700",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/20",
    loginHref: "/login",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    role: "Employee",
    desc: "View your assets, book shared resources, raise maintenance requests.",
    accent: "from-emerald-600 to-teal-700",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/20",
    loginHref: "/login/employee",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
]

const stats = [
  { value: "10K+", label: "Assets Tracked" },
  { value: "500+", label: "Organizations" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4", label: "Role Experiences" },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight">AssetFlow</span>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Enterprise</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.04]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6">
        {/* Background mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-blue-500/6 blur-[120px]" />
          <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/4 blur-[80px]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Enterprise Asset Management Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Manage Every Asset.
            <br />
            <span className="gradient-text">Every Role.</span>
            <br />
            One Platform.
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            AssetFlow is the enterprise-grade asset management system built for teams that demand precision. Track, allocate, audit, and optimize — with a tailored experience for every role in your organization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Sign In to Your Account
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold rounded-xl border border-white/[0.1] transition-all hover:-translate-y-0.5"
            >
              Create Employee Account
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative max-w-3xl mx-auto mt-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#0F172A] px-6 py-5 text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">One Platform, Four Experiences</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Each role gets a completely tailored interface — same design system, completely different product feel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((r) => (
              <div
                key={r.role}
                className={`group relative rounded-2xl border ${r.border} bg-[#0F172A] p-6 hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${r.glow} overflow-hidden`}
              >
                {/* Gradient top accent */}
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${r.accent} opacity-60`} />

                <div className="mb-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${r.badge}`}>
                    {r.role}
                  </span>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-6">{r.desc}</p>

                <Link
                  href={r.loginHref}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${r.accent} text-white text-sm font-semibold shadow-lg opacity-90 group-hover:opacity-100 transition-all`}
                >
                  Sign in as {r.role}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Purpose-built features for every stage of the asset lifecycle, from registration to retirement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={`rounded-2xl border ${f.border} bg-[#0F172A] p-6 hover:border-opacity-60 transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0F172A] to-[#111827] p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/8 blur-[80px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-slate-400 mb-8">
                Create your employee account and your admin will set up the rest.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  Create Employee Account
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold rounded-xl border border-white/[0.1] transition-all"
                >
                  Admin Login
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                {["WCAG AA Accessible", "SOC 2 Ready", "Zero data loss guarantee"].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-slate-300">AssetFlow Enterprise</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 AssetFlow. Built for enterprise teams.</p>
        </div>
      </footer>
    </div>
  )
}
