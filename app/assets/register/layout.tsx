import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function RegisterAssetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !["ADMIN", "ASSET_MANAGER"].includes(user.dbRole)) {
    redirect("/")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {children}
    </div>
  )
}
