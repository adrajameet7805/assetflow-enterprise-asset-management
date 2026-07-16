"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { AssetCategory, Department, AssetStatus } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function AssetFilters({
  categories,
  departments,
}: {
  categories: AssetCategory[]
  departments: Department[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.set("page", "1") // reset page on filter
      return params.toString()
    },
    [searchParams]
  )

  function handleFilterChange(name: string, value: string) {
    router.push(`/assets?${createQueryString(name, value)}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    handleFilterChange("search", search)
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
        <Input 
          placeholder="Search tag, serial, name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      
      <Select 
        value={searchParams.get("status") || "all"} 
        onValueChange={(val: string | null) => val && handleFilterChange("status", val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {Object.values(AssetStatus).map(status => (
            <SelectItem key={status} value={status}>{status}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={searchParams.get("categoryId") || "all"} 
        onValueChange={(val: string | null) => val && handleFilterChange("categoryId", val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={searchParams.get("departmentId") || "all"} 
        onValueChange={(val: string | null) => val && handleFilterChange("departmentId", val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map(d => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(searchParams.get("search") || searchParams.get("status") || searchParams.get("categoryId") || searchParams.get("departmentId")) && (
        <Button variant="ghost" onClick={() => router.push("/assets")}>
          Clear
        </Button>
      )}
    </div>
  )
}
