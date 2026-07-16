import Link from "next/link"
import { ShieldOff, ArrowLeft } from "lucide-react"

interface PermissionDeniedProps {
  message?: string
}

export function PermissionDenied({ message }: PermissionDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <ShieldOff className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">Access Denied</h2>
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
        {message || "You don't have permission to view this page. Contact your administrator if you believe this is an error."}
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold rounded-xl text-sm border border-white/[0.1] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
