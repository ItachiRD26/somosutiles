"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import type { Child } from "@/types"
import { getFirebaseDatabase } from "@/lib/firebase"
import { ref, update } from "firebase/database"
import { guardarEdicionOffline } from "@/lib/edit-pending"
import { useNetworkStatus } from "@/hooks/usenetworkstatus"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, User, Save, CheckCircle, AlertCircle, Calendar, School, MapPin, Users } from "lucide-react"

interface Props {
  child: Child
  onClose: () => void
  editable?: boolean
  id: string
}

export default function ChildDetailModal({ child, onClose, editable = false, id }: Props) {
  const [form, setForm] = useState<Child>(child)
  const isOnline = useNetworkStatus()
  const [mensajeGuardado, setMensajeGuardado] = useState("")
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error">("success")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setForm(child)
  }, [child])

  const handleChange = (field: keyof Child, value: string | number) => {
    if (field === "entregado") {
      setForm((prev) => ({ ...prev, [field]: value === 1 ? true : false }))
    } else {
      setForm((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = async () => {
    if (editable) {
      setIsLoading(true)
      try {
        const cambios = Object.entries(form) as [keyof Child, string | number | boolean][]

        for (const [field, value] of cambios) {
          if (isOnline) {
            const db = getFirebaseDatabase()
            await update(ref(db, `children/${id}`), { [field]: value })
          } else {
            guardarEdicionOffline(id, field, value as string | number)
          }
        }

        setMensajeGuardado("Cambios guardados correctamente.")
        setTipoMensaje("success")
        setTimeout(() => {
          setMensajeGuardado("")
          onClose()
        }, 1500)
      } catch (error) {
        console.error("Error al guardar:", error)
        setMensajeGuardado("Error al guardar los cambios.")
        setTipoMensaje("error")
        setTimeout(() => setMensajeGuardado(""), 3000)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl modal-content border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative pb-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-800">Detalles del Beneficiario</CardTitle>
              <p className="text-slate-600 text-sm">
                {editable ? "Edita la información del niño" : "Información del niño"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Badge
              variant={form.entregado ? "default" : "secondary"}
              className={`${form.entregado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
            >
              {form.entregado ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Entregado
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pendiente
                </>
              )}
            </Badge>
            {!isOnline && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Modo Offline
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-700 font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo
              </Label>
              <Input
                id="nombre"
                value={form.nombre}
                disabled={!editable}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={cn("border-slate-200 focus:border-blue-400 focus:ring-blue-400", !editable && "bg-slate-50")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edad" className="text-slate-700 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Edad
              </Label>
              <Input
                id="edad"
                value={form.edad}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={!editable}
                onChange={(e) => handleChange("edad", Number(e.target.value))}
                className={cn("border-slate-200 focus:border-blue-400 focus:ring-blue-400", !editable && "bg-slate-50")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero" className="text-slate-700 font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Género
            </Label>
            <Select
              value={form.genero || "Masculino"}
              disabled={!editable}
              onValueChange={(value) => handleChange("genero", value)}
            >
              <SelectTrigger
                className={cn("border-slate-200 focus:border-blue-400 focus:ring-blue-400", !editable && "bg-slate-50")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="escuela" className="text-slate-700 font-medium flex items-center gap-2">
                <School className="h-4 w-4" />
                Escuela
              </Label>
              <Input
                id="escuela"
                value={form.escuela || ""}
                disabled={!editable}
                onChange={(e) => handleChange("escuela", e.target.value)}
                className={cn("border-slate-200 focus:border-blue-400 focus:ring-blue-400", !editable && "bg-slate-50")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector" className="text-slate-700 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Sector
              </Label>
              <Input
                id="sector"
                value={form.sector || ""}
                disabled={!editable}
                onChange={(e) => handleChange("sector", e.target.value)}
                className={cn("border-slate-200 focus:border-blue-400 focus:ring-blue-400", !editable && "bg-slate-50")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entregado" className="text-slate-700 font-medium">
              Estado de Entrega
            </Label>
            <Select
              value={form.entregado ? "1" : "0"}
              disabled={!editable}
              onValueChange={(value) => handleChange("entregado", Number(value))}
            >
              <SelectTrigger
                className={cn("border-slate-200 focus:border-blue-400 focus:ring-blue-400", !editable && "bg-slate-50")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    No entregado
                  </div>
                </SelectItem>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Entregado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mensajeGuardado && (
            <Alert
              className={`${
                tipoMensaje === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
              }`}
            >
              {tipoMensaje === "success" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={`${tipoMensaje === "success" ? "text-emerald-700" : "text-red-700"}`}>
                {mensajeGuardado}
              </AlertDescription>
            </Alert>
          )}

          {editable && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button onClick={onClose} variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
