import { RoleLoginForm } from "@/features/auth/components/role-login-form"

export default function AdminLoginPage() {
  return (
    <RoleLoginForm
      role="ADMIN"
      heading="Welcome Back, Administrator"
      subtitle="Manage your organization, users, departments, assets, reports, and system settings."
      accentColor="bg-amber-500"
      accentHover="hover:bg-amber-600"
      accentText="text-amber-500"
      accentBorder="border-amber-500/50"
      accentGlow="hover:shadow-amber-500/25"
      illustrationTheme="navy"
    />
  )
}
