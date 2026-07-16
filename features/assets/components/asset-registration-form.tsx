"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AssetCategory, Department } from "@prisma/client"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

import { registerAssetSchema, type RegisterAssetFormData } from "../schemas"
import { registerAssetAction } from "@/actions/asset"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function AssetRegistrationForm({ 
  categories, 
  departments 
}: { 
  categories: AssetCategory[], 
  departments: Department[] 
}) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const form = useForm<RegisterAssetFormData>({
    resolver: zodResolver(registerAssetSchema) as any,
    defaultValues: {
      name: "",
      categoryId: "",
      serialNumber: "",
      acquisitionDate: "",
      acquisitionCost: undefined,
      condition: "NEW",
      location: "",
      photoUrls: [],
      documentUrls: [],
      isBookable: false,
      departmentId: "none"
    }
  })

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${type}s/${fileName}`

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

      const currentUrls = form.getValues(type === 'photo' ? 'photoUrls' : 'documentUrls') || []
      form.setValue(type === 'photo' ? 'photoUrls' : 'documentUrls', [...currentUrls, publicUrlData.publicUrl])
      
      toast.success(`${type === 'photo' ? 'Photo' : 'Document'} uploaded successfully`)
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(data: RegisterAssetFormData) {
    const result = await registerAssetAction(data)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Asset registered successfully!")
      router.push(`/assets/${result.assetId}`)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. MacBook Pro M3" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl><Input {...field} placeholder="Optional" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="FAIR">Fair</SelectItem>
                        <SelectItem value="POOR">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="acquisitionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acquisitionCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition Cost</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} placeholder="0.00" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Server Room A" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isBookable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Shared Resource (Bookable)</FormLabel>
                    <FormDescription>
                      Can this asset be booked temporarily by employees?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
               <div>
                  <FormLabel>Photos</FormLabel>
                  <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} disabled={isUploading} className="mt-2" />
                  <div className="mt-2 flex gap-2 text-sm text-muted-foreground flex-wrap">
                    {(form.watch('photoUrls') || []).map((url, i) => (
                      <span key={i}>Photo {i+1} uploaded</span>
                    ))}
                  </div>
               </div>
               <div>
                  <FormLabel>Documents</FormLabel>
                  <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'document')} disabled={isUploading} className="mt-2" />
                  <div className="mt-2 flex gap-2 text-sm text-muted-foreground flex-wrap">
                    {(form.watch('documentUrls') || []).map((url, i) => (
                      <span key={i}>Doc {i+1} uploaded</span>
                    ))}
                  </div>
               </div>
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Registering..." : "Register Asset"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
