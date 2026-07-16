import { RoleLoginForm } from "@/features/auth/components/role-login-form"

export default function EmployeeLoginPage() {
  return (
    <RoleLoginForm
      role="EMPLOYEE"
      heading="Employee Portal"
      subtitle="Access your assets, bookings, requests, and profile."
      accentColor="bg-emerald-500"
      accentHover="hover:bg-emerald-600"
      accentText="text-emerald-500"
      accentBorder="border-emerald-500/50"
      accentGlow="hover:shadow-emerald-500/25"
      illustrationTheme="green"
    />
  )
}
