"use client"

import { useNetworkStatus } from "@/hooks/usenetworkstatus"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export default function StatusIndicator() {
  const isOnline = useNetworkStatus()

  return (
    <Badge
      variant="outline"
      className={`transition-all duration-200 border-white/20 ${
        isOnline
          ? "bg-emerald-100/20 text-emerald-100 border-emerald-300/30 hover:bg-emerald-100/30"
          : "bg-red-100/20 text-red-100 border-red-300/30 hover:bg-red-100/30"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span className="text-xs font-medium">{isOnline ? "Online" : "Offline"}</span>
        <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
      </div>
    </Badge>
  )
}
