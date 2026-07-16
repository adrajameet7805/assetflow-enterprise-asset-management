import { getCategories } from "@/services/category.service"
import { getDepartments } from "@/services/department.service"
import { AssetRegistrationForm } from "@/features/assets/components/asset-registration-form"

export default async function RegisterAssetPage() {
  const [categories, departments] = await Promise.all([
    getCategories(),
    getDepartments()
  ])

  return (
    <div className="container mx-auto">
      <AssetRegistrationForm categories={categories} departments={departments} />
    </div>
  )
}
