"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, type UserCredential } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { guardarLocalmente, obtenerLocal } from "@/lib/utils"
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react"

interface UsuarioGuardado {
  uid: string
  email: string | null
  displayName: string
}

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const auth = getFirebaseAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg("")
    setIsLoading(true)

    try {
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user

      const usuarioGuardado: UsuarioGuardado = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? "",
      }

      const guardados = obtenerLocal("usuariosGuardados")
      const usuariosGuardados: UsuarioGuardado[] = Array.isArray(guardados) ? guardados : []

      const yaExiste = usuariosGuardados.some((u) => u.uid === usuarioGuardado.uid)

      if (!yaExiste) {
        guardarLocalmente("usuariosGuardados", [...usuariosGuardados, usuarioGuardado])
      }

      guardarLocalmente("usuarioActual", usuarioGuardado)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error de login:", error)
      setErrorMsg("Correo o contraseña incorrectos. Por favor, verifica tus credenciales.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const usuario = obtenerLocal("usuarioActual")
    if (usuario) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-12"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-12 pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-slate-400" />
              ) : (
                <Eye className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 h-12 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          ¿Problemas para acceder?{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            onClick={() => {
              // Aquí podrías agregar lógica para recuperar contraseña
              alert("Contacta al administrador para recuperar tu contraseña")
            }}
          >
            Contacta al administrador
          </button>
        </p>
      </div>
    </form>
  )
}
