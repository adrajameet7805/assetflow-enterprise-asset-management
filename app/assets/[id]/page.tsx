import { notFound } from "next/navigation"
import { format } from "date-fns"

import { getAssetDetails } from "@/services/asset.service"
import { getCategories } from "@/services/category.service"
import { getDepartments } from "@/services/department.service"
import { getUsers } from "@/services/user.service"
import { computeBookingStatus } from "@/services/booking.service"
import { getCurrentUser } from "@/lib/auth"

import { AssetQRCode } from "@/features/assets/components/asset-qr-code"
import { AllocationDialog } from "@/features/allocation/components/allocation-dialog"
import { ReturnDialog } from "@/features/allocation/components/return-dialog"
import { ApproveTransferButton } from "@/features/allocation/components/approve-transfer-button"
import { BookingForm } from "@/features/booking/components/booking-form"
import { BookingCalendar } from "@/features/booking/components/booking-calendar"
import { RaiseMaintenanceDialog } from "@/features/maintenance/components/raise-maintenance-dialog"
import { MaintenanceActionButtons } from "@/features/maintenance/components/maintenance-action-buttons"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const [asset, users, departments, currentUser] = await Promise.all([
    getAssetDetails(params.id),
    getUsers(),
    getDepartments(),
    getCurrentUser()
  ])
  
  if (!asset) return notFound()

  const canManage = currentUser && ["ADMIN", "ASSET_MANAGER"].includes(currentUser.dbRole)
  const activeAllocation = asset.allocations.find(a => a.returnedAt === null)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{asset.name}</h2>
          <p className="text-muted-foreground">{asset.tag}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={`text-lg px-4 py-1 ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : ''}`}>
            {asset.status}
          </Badge>
          <AssetQRCode assetId={asset.id} tag={asset.tag} />
          {currentUser && <RaiseMaintenanceDialog assetId={asset.id} />}
          {canManage && (
            <AllocationDialog assetId={asset.id} users={users} departments={departments} />
          )}
          {canManage && activeAllocation && (
            <ReturnDialog assetId={asset.id} allocationId={activeAllocation.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{asset.category.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{asset.department?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p className="font-medium">{asset.serialNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{asset.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-medium">{asset.condition}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookable Resource</p>
                <p className="font-medium">{asset.isBookable ? "Yes" : "No"}</p>
              </div>
              {asset.acquisitionDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Acquired On</p>
                  <p className="font-medium">{format(new Date(asset.acquisitionDate), "MMMM d, yyyy")}</p>
                </div>
              )}
              {asset.acquisitionCost && (
                <div>
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="font-medium">${Number(asset.acquisitionCost).toFixed(2)}</p>
                </div>
              )}
            </div>

            {(asset.photoUrls.length > 0 || asset.documentUrls.length > 0) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {asset.photoUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Photo {i+1}</a>
                    ))}
                    {asset.documentUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Doc {i+1}</a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Allocation History</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.allocations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No allocations recorded.</p>
              ) : (
                <div className="space-y-4">
                  {asset.allocations.map(a => (
                    <div key={a.id} className="text-sm border-l-2 border-primary pl-4 py-1 relative">
                      <p className="font-medium">{a.employee ? a.employee.name : (a.department?.name || "Unknown")}</p>
                      <p className="text-muted-foreground">{format(new Date(a.allocatedAt), "MMM d, yyyy")} - {a.returnedAt ? format(new Date(a.returnedAt), "MMM d, yyyy") : "Present"}</p>
                      {a.transferStatus === "REQUESTED" && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="mr-2">Transfer Requested</Badge>
                          {canManage && <ApproveTransferButton allocationId={a.id} assetId={asset.id} />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.maintenanceRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No maintenance recorded.</p>
              ) : (
                <div className="space-y-4">
                  {asset.maintenanceRequests.map(m => (
                    <div key={m.id} className="text-sm border-l-2 border-destructive pl-4 py-1">
                      <p className="font-medium">{m.issue}</p>
                      <p className="text-muted-foreground">Status: {m.status}</p>
                      {m.photoUrl && (
                        <a href={m.photoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View Photo</a>
                      )}
                      {m.resolutionNote && (
                        <p className="text-muted-foreground mt-1">Resolution: {m.resolutionNote}</p>
                      )}
                      <MaintenanceActionButtons 
                        requestId={m.id} 
                        assetId={asset.id} 
                        status={m.status} 
                        canManage={!!canManage} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {asset.isBookable && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Bookings</CardTitle>
                <BookingForm assetId={asset.id} />
              </CardHeader>
              <CardContent className="pt-4">
                <BookingCalendar 
                  assetId={asset.id} 
                  bookings={asset.bookings.map(b => ({ ...b, status: computeBookingStatus(b) }))} 
                  currentUserId={currentUser?.id} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
