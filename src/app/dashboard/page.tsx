"use client"

import { useEffect, useState, useCallback } from "react"
import { ref, onValue } from "firebase/database"
import { getFirebaseDatabase } from "@/lib/firebase"
import { obtenerCacheLocal, actualizarCacheLocal, sincronizarRegistrosOffline } from "@/lib/offline-sync"
import type { Child } from "@/types"
import { useNetworkStatus } from "@/hooks/usenetworkstatus"
import { parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, Clock, TrendingUp, Calendar, School } from "lucide-react"

export default function DashboardPage() {
  const [children, setChildren] = useState<Child[]>([])
  const isOnline = useNetworkStatus()

const cargarDatos = useCallback(() => {
  if (isOnline) {
    const db = getFirebaseDatabase()
    const dbRef = ref(db, "children")

    onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const arrayChildren: Child[] = Object.entries(data).map(([id, value]) => ({
          ...(value as Child),
          id,
        }))
        const sinDuplicados = filtrarDuplicados(arrayChildren)
        setChildren(sinDuplicados)
        actualizarCacheLocal(sinDuplicados)
      }
    })

    sincronizarRegistrosOffline()
  } else {
    const localData = obtenerCacheLocal()
    const sinDuplicados = filtrarDuplicados(localData)
    setChildren(sinDuplicados)
  }
}, [isOnline])

const filtrarDuplicados = (lista: Child[]): Child[] => {
  const mapa = new Map<string, Child>()
  for (const child of lista) {
    const clave = `${child.nombre}-${child.fechaRegistro}`
    if (!mapa.has(clave)) {
      mapa.set(clave, child)
    }
  }
  return Array.from(mapa.values())
}



  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

useEffect(() => {
  const actualizar = () => {
    const localData = obtenerCacheLocal()
    const sinDuplicados = filtrarDuplicados(localData)
    setChildren(sinDuplicados)
  }

  window.addEventListener("registroOfflineNuevo", actualizar)
  return () => window.removeEventListener("registroOfflineNuevo", actualizar)
}, [])

  const total = children.length
  const entregados = children.filter((c) => c.entregado).length
  const pendientes = total - entregados
  const edadPromedio = total > 0 ? (children.reduce((acc, c) => acc + (c.edad || 0), 0) / total).toFixed(1) : "0"

  const ultimosRegistros = [...children]
    .filter((c) => c.fechaRegistro)
    .sort((a, b) => parseISO(b.fechaRegistro!).getTime() - parseISO(a.fechaRegistro!).getTime())
    .slice(0, 5)

  const porcentajeEntregados = total > 0 ? Math.round((entregados / total) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-slate-600">Resumen general del sistema de distribución</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Registrados</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{total}</div>
            <p className="text-xs text-blue-600 mt-1">niños en el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Útiles Entregados</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-800">{entregados}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                {porcentajeEntregados}%
              </Badge>
              <p className="text-xs text-emerald-600">completado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Pendientes</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-800">{pendientes}</div>
            <p className="text-xs text-amber-600 mt-1">Por entregar</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Edad Promedio</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{edadPromedio}</div>
            <p className="text-xs text-purple-600 mt-1">años</p>
          </CardContent>
        </Card>
      </div>

      {/* Últimos registros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg text-slate-800">Últimos Registros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {ultimosRegistros.length === 0 ? (
              <div className="text-center py-8">
                <School className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No hay registros disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ultimosRegistros.map((child, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {child.nombre?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{child.nombre}</p>
                        <p className="text-sm text-slate-500">{child.escuela}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{new Date(child.fechaRegistro!).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{new Date(child.fechaRegistro!).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Progreso de Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Completado</span>
                  <span className="font-medium text-slate-800">{porcentajeEntregados}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeEntregados}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-700">{entregados}</div>
                  <div className="text-sm text-emerald-600">Entregados</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-700">{pendientes}</div>
                  <div className="text-sm text-amber-600">Pendientes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
