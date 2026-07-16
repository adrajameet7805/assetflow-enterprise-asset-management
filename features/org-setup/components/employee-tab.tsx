"use client"

import { User, Department, UserRole } from "@prisma/client"
import { toast } from "sonner"
import { MoreHorizontal } from "lucide-react"

import { promoteUserAction } from "@/actions/user"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function EmployeeDirectoryTab({ users }: { users: (User & { department: Department | null })[] }) {

  async function handlePromote(userId: string, role: UserRole) {
    const result = await promoteUserAction(userId, role)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`User promoted to ${role}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Employee Directory</h3>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department?.name || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.role !== "DEPARTMENT_HEAD" && (
                          <DropdownMenuItem onClick={() => handlePromote(user.id, "DEPARTMENT_HEAD")}>
                            Promote to Dept Head
                          </DropdownMenuItem>
                        )}
                        {user.role !== "ASSET_MANAGER" && (
                          <DropdownMenuItem onClick={() => handlePromote(user.id, "ASSET_MANAGER")}>
                            Promote to Asset Manager
                          </DropdownMenuItem>
                        )}
                        {user.role !== "ADMIN" && (
                          <DropdownMenuItem onClick={() => handlePromote(user.id, "ADMIN")}>
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        {user.role !== "EMPLOYEE" && (
                          <DropdownMenuItem onClick={() => handlePromote(user.id, "EMPLOYEE")}>
                            Demote to Employee
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
