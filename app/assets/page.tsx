import { getAssets } from "@/services/asset.service"
import { getCategories } from "@/services/category.service"
import { getDepartments } from "@/services/department.service"
import { AssetDirectoryTable } from "@/features/assets/components/asset-directory-table"
import { AssetFilters } from "@/features/assets/components/asset-filters"
import { AssetStatus } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Package, SlidersHorizontal } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await getCurrentUser()
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const categoryId = typeof searchParams.categoryId === "string" ? searchParams.categoryId : undefined
  const departmentId = typeof searchParams.departmentId === "string" ? searchParams.departmentId : undefined
  const status = typeof searchParams.status === "string" ? (searchParams.status as AssetStatus) : undefined
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined

  const [categories, departments, { items, total, totalPages }] = await Promise.all([
    getCategories(),
    getDepartments(),
    getAssets({ search, categoryId, departmentId, status, location }, page, 10)
  ])

  const canRegister = user && ["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-400">Assets</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Asset Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} asset{total !== 1 ? "s" : ""} across all departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canRegister && (
            <Link href="/assets/register">
              <Button className="h-9 gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-0 font-medium">
                <Plus className="w-4 h-4" />
                Register Asset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-4">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-400">Filters</span>
        </div>
        <AssetFilters categories={categories} departments={departments} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-200">All Assets</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-medium">
              {total}
            </span>
          </div>
        </div>
        <AssetDirectoryTable data={items} pageCount={totalPages} currentPage={page} />
      </div>
    </div>
  )
}
