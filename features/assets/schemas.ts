import { z } from "zod"

export const registerAssetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional(),
  acquisitionDate: z.string().optional(), // We'll parse to Date on server if provided
  acquisitionCost: z.coerce.number().optional(),
  condition: z.string().min(1, "Condition is required"),
  location: z.string().min(1, "Location is required"),
  photoUrls: z.array(z.string()).optional(),
  documentUrls: z.array(z.string()).optional(),
  isBookable: z.boolean().optional(),
  departmentId: z.string().optional(),
})

export type RegisterAssetFormData = z.infer<typeof registerAssetSchema>
