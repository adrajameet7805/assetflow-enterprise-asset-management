import { getDepartments } from "@/services/department.service"
import { getCategories } from "@/services/category.service"
import { getUsers } from "@/services/user.service"
import { OrgSetupTabs } from "@/features/org-setup/components/org-setup-tabs"

export default async function OrgSetupPage() {
  const [departments, categories, users] = await Promise.all([
    getDepartments(),
    getCategories(),
    getUsers()
  ])

  return (
    <OrgSetupTabs 
      departments={departments} 
      categories={categories} 
      users={users} 
    />
  )
}
