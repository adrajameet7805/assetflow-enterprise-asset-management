import { z } from "zod"

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  headId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})
export type DepartmentFormData = z.infer<typeof departmentSchema>

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  customFields: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required") // In this case, maybe default value or description
  }))
})
export type CategoryFormData = z.infer<typeof categorySchema>
