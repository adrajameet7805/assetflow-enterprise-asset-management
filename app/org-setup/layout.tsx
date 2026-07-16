import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function OrgSetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.dbRole !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Organization Setup</h2>
      </div>
      {children}
    </div>
  )
}
