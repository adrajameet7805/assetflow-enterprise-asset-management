import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-white/[0.04]" />
          <Skeleton className="h-8 w-72 bg-white/[0.06]" />
          <Skeleton className="h-4 w-56 bg-white/[0.04]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36 bg-white/[0.06] rounded-xl" />
          <Skeleton className="h-9 w-32 bg-white/[0.04] rounded-xl" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="xl:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827] p-6">
            <div className="flex justify-between mb-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-white/[0.06]" />
                <Skeleton className="h-8 w-16 bg-white/[0.08]" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl bg-white/[0.04]" />
            </div>
            <Skeleton className="h-3 w-32 bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <Skeleton className="h-5 w-32 bg-white/[0.06]" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111827] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <Skeleton className="h-5 w-28 bg-white/[0.06]" />
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
