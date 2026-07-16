import { RoleLoginForm } from "@/features/auth/components/role-login-form"

export default function AssetManagerLoginPage() {
  return (
    <RoleLoginForm
      role="ASSET_MANAGER"
      heading="Asset Manager Portal"
      subtitle="Manage assets, allocations, maintenance, transfers, and inventory."
      accentColor="bg-blue-500"
      accentHover="hover:bg-blue-600"
      accentText="text-blue-500"
      accentBorder="border-blue-500/50"
      accentGlow="hover:shadow-blue-500/25"
      illustrationTheme="blue"
    />
  )
}
