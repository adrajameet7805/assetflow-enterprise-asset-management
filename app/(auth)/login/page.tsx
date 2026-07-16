import Link from "next/link"
import { Shield, Box, Building2, UserCircle, ArrowLeft } from "lucide-react"

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-8 h-24 flex items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative z-10 -mt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Select Your Portal
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Choose your role to access the corresponding workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl">
          
          {/* Admin */}
          <Link href="/login/admin" className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl hover:bg-slate-900/80 hover:border-amber-500/30 transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Super Admin</h3>
            <p className="text-slate-400 text-sm">Executive control, analytics, and system configuration.</p>
          </Link>

          {/* Asset Manager */}
          <Link href="/login/asset-manager" className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl hover:bg-slate-900/80 hover:border-blue-500/30 transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <Box className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Asset Manager</h3>
            <p className="text-slate-400 text-sm">Inventory oversight, maintenance, and allocation logistics.</p>
          </Link>

          {/* Department Head */}
          <Link href="/login/department-head" className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl hover:bg-slate-900/80 hover:border-purple-500/30 transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Department Head</h3>
            <p className="text-slate-400 text-sm">Team management, booking approvals, and department analytics.</p>
          </Link>

          {/* Employee */}
          <Link href="/login/employee" className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl hover:bg-slate-900/80 hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
              <UserCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Employee</h3>
            <p className="text-slate-400 text-sm">Personal workspace, asset requests, and resource bookings.</p>
          </Link>

        </div>
      </main>
    </div>
  )
}
