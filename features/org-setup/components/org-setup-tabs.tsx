"use client"

import { Department, AssetCategory, User } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DepartmentTab } from "./department-tab"
import { CategoryTab } from "./category-tab"
import { EmployeeDirectoryTab } from "./employee-tab"

type OrgSetupTabsProps = {
  departments: (Department & { parent: Department | null })[]
  categories: AssetCategory[]
  users: (User & { department: Department | null })[]
}

export function OrgSetupTabs({ departments, categories, users }: OrgSetupTabsProps) {
  return (
    <Tabs defaultValue="departments" className="space-y-4">
      <TabsList>
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="categories">Asset Categories</TabsTrigger>
        <TabsTrigger value="employees">Employee Directory</TabsTrigger>
      </TabsList>
      <TabsContent value="departments" className="space-y-4">
        <DepartmentTab departments={departments} users={users} />
      </TabsContent>
      <TabsContent value="categories" className="space-y-4">
        <CategoryTab categories={categories} />
      </TabsContent>
      <TabsContent value="employees" className="space-y-4">
        <EmployeeDirectoryTab users={users} />
      </TabsContent>
    </Tabs>
  )
}
