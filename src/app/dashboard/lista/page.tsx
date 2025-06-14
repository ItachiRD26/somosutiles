"use client"

import { useEffect, useState, useCallback } from "react"
import type { Child } from "@/types"
import { getFirebaseDatabase } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { actualizarCacheLocal, obtenerCacheLocal, sincronizarRegistrosOffline } from "@/lib/offline-sync"
import { useNetworkStatus } from "@/hooks/usenetworkstatus"
import ChildDetailModal from "@/components/childdetailmodal"
import { parseISO, isWithinInterval, subDays, subMonths, subYears } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, CheckCircle, XCircle, Calendar, School, MapPin } from "lucide-react"

export default function ListaPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedId, setSelectedId] = useState<string>("")
  const [filterName, setFilterName] = useState("")
  const [filterAge, setFilterAge] = useState<number | null>(null)
  const [filterSchool, setFilterSchool] = useState("")
  const [filterSector, setFilterSector] = useState("")
  const [filterDate, setFilterDate] = useState("all")

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

  const abrirModal = (child: Child, id: string) => {
    setSelectedChild(child)
    setSelectedId(id)
  }

  const escuelas = Array.from(new Set(children.map((c) => c.escuela).filter(Boolean)))
  const sectores = Array.from(new Set(children.map((c) => c.sector).filter(Boolean)))

  const childrenFiltrados = children.filter((child) => {
    const nombreMatch = child.nombre?.toLowerCase().includes(filterName.toLowerCase())
    const edadMatch = filterAge === null || child.edad === filterAge
    const escuelaMatch = !filterSchool || child.escuela === filterSchool
    const sectorMatch = !filterSector || child.sector === filterSector

    let fechaMatch = true
    if (filterDate !== "all" && child.fechaRegistro) {
      const fecha = parseISO(child.fechaRegistro)
      const ahora = new Date()
      const intervalos: Record<string, Date> = {
        "24h": subDays(ahora, 1),
        "7d": subDays(ahora, 7),
        "1m": subMonths(ahora, 1),
        "1y": subYears(ahora, 1),
      }
      fechaMatch = isWithinInterval(fecha, {
        start: intervalos[filterDate],
        end: ahora,
      })
    }

    return nombreMatch && edadMatch && escuelaMatch && sectorMatch && fechaMatch
  })

  const totalFiltrados = childrenFiltrados.length
  const entregadosFiltrados = childrenFiltrados.filter((c) => c.entregado).length

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Lista de los niños</h1>
        <p className="text-slate-600">Gestiona y consulta la información de todos los niños registrados</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-800">{totalFiltrados}</p>
                <p className="text-sm text-blue-600">Total mostrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-800">{entregadosFiltrados}</p>
                <p className="text-sm text-emerald-600">Entregados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-800">{totalFiltrados - entregadosFiltrados}</p>
                <p className="text-sm text-amber-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg text-slate-800">Filtros de Búsqueda</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Buscar por nombre</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nombre del niño..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Edad</label>
              <Input
                placeholder="Edad específica"
                type="number"
                value={filterAge ?? ""}
                onChange={(e) => setFilterAge(e.target.value ? Number(e.target.value) : null)}
                className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Escuela</label>
              <Select value={filterSchool} onValueChange={setFilterSchool}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Todas las escuelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las escuelas</SelectItem>
                  {escuelas.map((esc, i) => (
                    <SelectItem key={i} value={esc}>
                      {esc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sector</label>
              <Select value={filterSector} onValueChange={setFilterSector}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {sectores.map((sec, i) => (
                    <SelectItem key={i} value={sec}>
                      {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Período</label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los registros</SelectItem>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="1m">Último mes</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de niños */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">
            Resultados ({totalFiltrados} {totalFiltrados === 1 ? "registro" : "registros"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childrenFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">No hay registros que coincidan</p>
              <p className="text-slate-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {childrenFiltrados.map((child) => (
                <div
                  key={child.id}
                  className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                  onClick={() => abrirModal(child, child.id || "")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {child.nombre?.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-800 text-lg">{child.nombre}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{child.edad} años</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <School className="h-4 w-4" />
                            <span>{child.escuela}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{child.sector}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={child.entregado ? "default" : "secondary"}
                        className={`${
                          child.entregado
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        } px-3 py-1`}
                      >
                        {child.entregado ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Entregado
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Pendiente
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedChild && (
        <ChildDetailModal
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
          editable={true}
          id={selectedId}
        />
      )}
    </div>
  )
}
