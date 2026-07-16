import { RoleLoginForm } from "@/features/auth/components/role-login-form"

export default function DepartmentHeadLoginPage() {
  return (
    <RoleLoginForm
      role="DEPARTMENT_HEAD"
      heading="Department Head Portal"
      subtitle="Manage your department, approvals, bookings, and employees."
      accentColor="bg-purple-500"
      accentHover="hover:bg-purple-600"
      accentText="text-purple-500"
      accentBorder="border-purple-500/50"
      accentGlow="hover:shadow-purple-500/25"
      illustrationTheme="purple"
    />
  )
}
