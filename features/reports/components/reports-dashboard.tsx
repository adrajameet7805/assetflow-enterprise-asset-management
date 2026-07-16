"use client"

import { useMemo } from "react"
import { Download } from "lucide-react"
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function ReportsDashboard({ 
  deptAllocations, 
  statusDistribution, 
  maintenanceFreq 
}: { 
  deptAllocations: any[], 
  statusDistribution: any[], 
  maintenanceFreq: any[] 
}) {
  
  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return
    const keys = Object.keys(data[0])
    const csvContent = [
      keys.join(","),
      ...data.map(row => keys.map(k => `"${row[k]}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Allocations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Allocations by Department</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV(deptAllocations, "department-allocations")}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {deptAllocations.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No data available</p>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptAllocations}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {deptAllocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Asset Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Global Asset Status</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV(statusDistribution, "asset-status")}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {statusDistribution.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No data available</p>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 3: Maintenance Frequency */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Maintenance Requests by Category</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV(maintenanceFreq, "maintenance-frequency")}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {maintenanceFreq.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No maintenance data available</p>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceFreq}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="requests" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
