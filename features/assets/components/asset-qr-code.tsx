"use client"

import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function AssetQRCode({ assetId, tag }: { assetId: string, tag: string }) {
  // In a real app, this would be the fully qualified URL, e.g. `https://assetflow.com/assets/${assetId}`
  // For now, we'll use a relative or dummy origin.
  const url = typeof window !== 'undefined' ? `${window.location.origin}/assets/${assetId}` : `/assets/${assetId}`

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen") as HTMLCanvasElement
    if (!canvas) return
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream")
    const downloadLink = document.createElement("a")
    downloadLink.href = pngUrl
    downloadLink.download = `${tag}-qr.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-card">
      <div className="bg-white p-2 rounded">
        <QRCodeCanvas
          id="qr-gen"
          value={url}
          size={150}
          level="H"
        />
      </div>
      <Button variant="outline" size="sm" onClick={downloadQR}>
        <Download className="mr-2 h-4 w-4" /> Download QR
      </Button>
    </div>
  )
}
