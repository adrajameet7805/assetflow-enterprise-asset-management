"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Department, User } from "@prisma/client"
import { toast } from "sonner"
import { Plus, Edit2, PowerOff } from "lucide-react"

import { departmentSchema, type DepartmentFormData } from "../schemas"
import { createDepartmentAction, updateDepartmentAction, deactivateDepartmentAction } from "@/actions/department"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DepartmentTab({ departments, users }: { departments: (Department & { parent: Department | null })[], users: User[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      headId: "none",
      parentId: "none",
      status: "ACTIVE"
    }
  })

  function openCreate() {
    setEditingId(null)
    form.reset({ name: "", headId: "none", parentId: "none", status: "ACTIVE" })
    setIsOpen(true)
  }

  function openEdit(dept: Department) {
    setEditingId(dept.id)
    form.reset({
      name: dept.name,
      headId: dept.headId || "none",
      parentId: dept.parentId || "none",
      status: dept.status as "ACTIVE" | "INACTIVE"
    })
    setIsOpen(true)
  }

  async function onSubmit(data: DepartmentFormData) {
    const payload = {
      ...data,
      headId: data.headId === "none" ? null : data.headId,
      parentId: data.parentId === "none" ? null : data.parentId,
    }

    let result
    if (editingId) {
      result = await updateDepartmentAction(editingId, payload)
    } else {
      result = await createDepartmentAction(payload)
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingId ? "Department updated" : "Department created")
      setIsOpen(false)
    }
  }

  async function handleDeactivate(id: string) {
    const result = await deactivateDepartmentAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Department deactivated")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Departments</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreate} />}>
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Department" : "Create Department"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Head</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a head" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {users.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {departments.filter(d => d.id !== editingId).map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => {
                const head = users.find(u => u.id === dept.headId)
                return (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.parent?.name || "-"}</TableCell>
                    <TableCell>{head?.name || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${dept.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {dept.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {dept.status === 'ACTIVE' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeactivate(dept.id)} className="text-destructive">
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No departments found.
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
