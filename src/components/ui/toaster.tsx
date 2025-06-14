"use client"

import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { ToastUI } = useToast()

  return <ToastUI />
}
