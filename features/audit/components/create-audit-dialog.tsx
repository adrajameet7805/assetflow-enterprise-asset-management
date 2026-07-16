"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { createAuditCycleAction } from "@/actions/audit"

export function CreateAuditDialog({ 
  departments, 
  users 
}: { 
  departments: { id: string; name: string }[],
  users: { id: string; name: string, email: string }[] 
}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [scopeDeptId, setScopeDeptId] = useState<string>("ALL")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [auditorId, setAuditorId] = useState("")

  async function handleCreate() {
    if (!startDate || !endDate || !auditorId) {
      toast.error("Please fill in dates and assign an auditor.")
      return
    }

    setIsSubmitting(true)
    const result = await createAuditCycleAction({
      scopeDeptId: scopeDeptId === "ALL" ? null : scopeDeptId,
      location: location.trim() === "" ? null : location.trim(),
      startDate,
      endDate,
      auditorIds: [auditorId], // UI simplification for hackathon scope
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Audit cycle created successfully.")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4"/> New Audit Cycle</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Audit Cycle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Scope: Department</Label>
            <Select value={scopeDeptId} onValueChange={(val: string | null) => val && setScopeDeptId(val)}>
              <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scope: Location (Optional)</Label>
            <Input 
              placeholder="e.g. Building A" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign Auditor</Label>
            <Select value={auditorId} onValueChange={(val: string | null) => val && setAuditorId(val)}>
              <SelectTrigger><SelectValue placeholder="Select an auditor..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>Create Cycle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
