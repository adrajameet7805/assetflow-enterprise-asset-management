import Link from "next/link"
import { Zap } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-16 relative">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-slate-400">AssetFlow</span>
      </Link>

      {/* 404 display */}
      <div className="relative mb-8">
        <div className="text-[140px] font-black text-transparent bg-clip-text leading-none select-none"
          style={{ backgroundImage: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))", WebkitBackgroundClip: "text" }}>
          404
        </div>
        <div className="absolute inset-0 text-[140px] font-black text-transparent bg-clip-text leading-none"
          style={{ backgroundImage: "linear-gradient(135deg, #3B82F6, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", maskImage: "linear-gradient(to bottom, black 0%, transparent 80%)" }}>
          404
        </div>
      </div>

      <div className="relative max-w-md">
        <h1 className="text-2xl font-bold text-slate-100 mb-3">Page Not Found</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL or head back to your dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/login/employee"
            className="w-full sm:w-auto px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold rounded-xl text-sm border border-white/[0.1] transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
