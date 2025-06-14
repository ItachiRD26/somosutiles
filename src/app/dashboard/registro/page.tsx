"use client"

import type React from "react"

import { useState } from "react"
import { getFirebaseDatabase } from "@/lib/firebase"
import { ref, push } from "firebase/database"
import { guardarRegistroOffline } from "@/lib/offline-sync"
import type { Child } from "@/types"
import { useNetworkStatus } from "@/hooks/usenetworkstatus"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegistroPage() {
  const [child, setChild] = useState<Child>({
    nombre: "",
    edad: 0,
    escuela: "",
    sector: "",
    genero: "Masculino",
    entregado: false,
    fechaRegistro: new Date().toISOString(),
  })

  const [mensaje, setMensaje] = useState("")
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error">("success")
  const [cargando, setCargando] = useState(false)
  const isOnline = useNetworkStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      if (isOnline) {
        const db = getFirebaseDatabase()
        const refReg = ref(db, "children")
        await push(refReg, child)
      } else {
        await guardarRegistroOffline(child)
      }

      setMensaje("Niño registrado exitosamente.")
      setTipoMensaje("success")
      setChild({
        nombre: "",
        edad: 0,
        escuela: "",
        sector: "",
        genero: "Masculino",
        entregado: false,
        fechaRegistro: new Date().toISOString(),
      })

      setTimeout(() => {
        setMensaje("")
      }, 1500)
    } catch (err) {
      console.error("Error registrando:", err)
      setMensaje("Ocurrió un error. Intenta de nuevo.")
      setTipoMensaje("error")
      setTimeout(() => setMensaje(""), 3000)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Registrar Niño</h1>
        <p className="text-slate-600">Ingresa la información del nuevo beneficiario</p>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl text-slate-800">Información del Beneficiario</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-slate-700 font-medium">
                  Nombre Completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ingresa el nombre completo"
                  value={child.nombre}
                  onChange={(e) => setChild({ ...child, nombre: e.target.value })}
                  required
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad" className="text-slate-700 font-medium">
                  Edad
                </Label>
                <Input
                  id="edad"
                  type="number"
                  placeholder="Edad en años"
                  value={child.edad || ""}
                  onChange={(e) => setChild({ ...child, edad: Number(e.target.value) })}
                  required
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero" className="text-slate-700 font-medium">
                Género
              </Label>
              <Select value={child.genero} onValueChange={(value) => setChild({ ...child, genero: value })}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Selecciona el género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="escuela" className="text-slate-700 font-medium">
                  Escuela
                </Label>
                <Input
                  id="escuela"
                  type="text"
                  placeholder="Nombre de la escuela"
                  value={child.escuela}
                  onChange={(e) => setChild({ ...child, escuela: e.target.value })}
                  required
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector" className="text-slate-700 font-medium">
                  Sector
                </Label>
                <Input
                  id="sector"
                  type="text"
                  placeholder="Sector o zona"
                  value={child.sector}
                  onChange={(e) => setChild({ ...child, sector: e.target.value })}
                  required
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-slate-700 font-medium">
                Fecha de Registro
              </Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={child.fechaRegistro?.slice(0, 16)}
                onChange={(e) =>
                  setChild({
                    ...child,
                    fechaRegistro: new Date(e.target.value).toISOString(),
                  })
                }
                className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            {mensaje && (
              <Alert
                className={`${tipoMensaje === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
              >
                {tipoMensaje === "success" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={`${tipoMensaje === "success" ? "text-emerald-700" : "text-red-700"}`}>
                  {mensaje}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Niño
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
