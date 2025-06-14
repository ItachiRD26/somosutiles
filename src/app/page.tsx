"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

// Carga dinámica para evitar errores de inicialización en tiempo de build
const LoginForm = dynamic(() => import("@/components/login-form"), { ssr: false })

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Image src="/logo.png" alt="Logo" width={60} height={60} className="rounded-xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">TODOS SOMOS UTILES</h1>
          <p className="text-slate-600">Sistema de gestión para la distribución de útiles escolares</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
