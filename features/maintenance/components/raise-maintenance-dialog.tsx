"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Wrench } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { raiseMaintenanceAction } from "@/actions/maintenance"
import { createClient } from "@/lib/supabase/client"

export function RaiseMaintenanceDialog({ assetId }: { assetId: string }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [issue, setIssue] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [file, setFile] = useState<File | null>(null)

  const supabase = createClient()

  async function handleRaise() {
    if (!issue) {
      toast.error("Please describe the issue.")
      return
    }

    setIsSubmitting(true)
    let photoUrl = null

    if (file) {
      const ext = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`
      
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(`maintenance/${fileName}`, file)

      if (error) {
        toast.error("Failed to upload photo.")
        setIsSubmitting(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(`maintenance/${fileName}`)
        
      photoUrl = urlData.publicUrl
    }

    const result = await raiseMaintenanceAction({
      assetId,
      issue,
      priority,
      photoUrl,
    })
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Maintenance request submitted.")
      setOpen(false)
      setIssue("")
      setFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline"><Wrench className="mr-2 h-4 w-4"/> Raise Issue</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Maintenance Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Describe Issue <span className="text-red-500">*</span></Label>
            <Textarea 
              value={issue} 
              onChange={e => setIssue(e.target.value)} 
              placeholder="What is wrong with the asset?" 
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(val: string | null) => val && setPriority(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <Input 
              type="file" 
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleRaise} disabled={isSubmitting}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
