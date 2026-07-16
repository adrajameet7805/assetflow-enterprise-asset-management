"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AssetCategory } from "@prisma/client"
import { toast } from "sonner"
import { Plus, Edit2, Trash2 } from "lucide-react"

import { categorySchema, type CategoryFormData } from "../schemas"
import { createCategoryAction, updateCategoryAction } from "@/actions/category"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CategoryTab({ categories }: { categories: AssetCategory[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      customFields: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: "customFields",
    control: form.control,
  })

  function openCreate() {
    setEditingId(null)
    form.reset({ name: "", customFields: [] })
    setIsOpen(true)
  }

  function openEdit(category: AssetCategory) {
    setEditingId(category.id)
    const customFields = category.customFields ? Object.entries(category.customFields as Record<string, string>).map(([key, value]) => ({ key, value })) : []
    form.reset({
      name: category.name,
      customFields
    })
    setIsOpen(true)
  }

  async function onSubmit(data: CategoryFormData) {
    let result
    if (editingId) {
      result = await updateCategoryAction(editingId, data)
    } else {
      result = await createCategoryAction(data)
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingId ? "Category updated" : "Category created")
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Asset Categories</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreate} />}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Create Category"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Laptops" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Custom Fields</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                      <Plus className="mr-1 h-3 w-3" /> Add Field
                    </Button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`customFields.${index}.key`}
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl><Input {...field} placeholder="Key (e.g. warranty_months)" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`customFields.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl><Input {...field} placeholder="Description or Type" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No custom fields added.</p>
                  )}
                </div>

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
                <TableHead>Custom Fields</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => {
                const keys = cat.customFields ? Object.keys(cat.customFields as Record<string, string>) : []
                return (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      {keys.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {keys.map(k => (
                            <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                              {k}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No categories found.
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
