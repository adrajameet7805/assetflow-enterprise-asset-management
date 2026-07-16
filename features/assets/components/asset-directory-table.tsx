"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Package, ArrowUpRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Asset, AssetCategory, Department } from "@prisma/client"
import { cn } from "@/lib/utils"

type AssetWithRelations = Asset & {
  category: AssetCategory
  department: Department | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "status-available" },
  ALLOCATED: { label: "Allocated", className: "status-allocated" },
  RESERVED: { label: "Reserved", className: "status-reserved" },
  UNDER_MAINTENANCE: { label: "Maintenance", className: "status-under_maintenance" },
  LOST: { label: "Lost", className: "status-lost" },
  RETIRED: { label: "Retired", className: "status-retired" },
  DISPOSED: { label: "Disposed", className: "status-disposed" },
}

const columns: ColumnDef<AssetWithRelations>[] = [
  {
    accessorKey: "tag",
    header: "Tag / Asset",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div>
          <Link
            href={`/assets/${row.original.id}`}
            className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors flex items-center gap-1 group"
          >
            {row.original.name}
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <span className="text-[11px] text-slate-600 font-mono">{row.getValue("tag")}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{row.original.category?.name || "—"}</span>
    ),
  },
  {
    accessorKey: "department.name",
    header: "Department",
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{row.original.department?.name || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const config = statusConfig[status] || { label: status, className: "status-available" }
      return (
        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold", config.className)}>
          {config.label}
        </span>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">{row.original.location || "—"}</span>
    ),
  },
  {
    accessorKey: "acquisitionDate",
    header: "Acquired",
    cell: ({ row }) => {
      const date = row.getValue("acquisitionDate") as Date | null
      return (
        <span className="text-sm text-slate-500">
          {date ? format(new Date(date), "MMM d, yyyy") : "—"}
        </span>
      )
    },
  },
]

interface AssetDirectoryTableProps {
  data: AssetWithRelations[]
  pageCount: number
  currentPage: number
}

export function AssetDirectoryTable({ data, pageCount, currentPage }: AssetDirectoryTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/assets?${params.toString()}`)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-white/[0.06] hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-slate-500 text-xs font-semibold uppercase tracking-wider py-3 px-6 bg-white/[0.02]"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-default"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3.5 px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">No assets found</p>
                    <p className="text-xs text-slate-600 mt-1">Try adjusting your filters or search query</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06]">
        <span className="text-xs text-slate-600">
          Page {currentPage} of {pageCount || 1}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-7 px-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-7 h-7 text-xs rounded-lg transition-all",
                    page === currentPage
                      ? "bg-blue-500 text-white font-semibold"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                  )}
                >
                  {page}
                </button>
              )
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pageCount}
            className="h-7 px-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
