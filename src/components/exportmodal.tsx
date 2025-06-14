"use client"

import { useState } from "react"
import { obtenerCacheLocal } from "@/lib/offline-sync"
import { parseISO, isWithinInterval, subDays, subMonths, subYears } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import type { Registro } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Download, FileText, FileSpreadsheet, Calendar, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ExportModalProps {
  onClose: () => void
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const [rango, setRango] = useState("24h")
  const [formato, setFormato] = useState("excel")
  const [isExporting, setIsExporting] = useState(false)

  const filtrarPorRango = (): Registro[] => {
    const todos: Registro[] = obtenerCacheLocal()
    const ahora = new Date()

    if (rango === "all") return todos

    const limites: Record<string, Date> = {
      "24h": subDays(ahora, 1),
      "7d": subDays(ahora, 7),
      "1m": subMonths(ahora, 1),
      "1y": subYears(ahora, 1),
    }

    return todos.filter((c) => {
      if (!c.fechaRegistro) return false
      const fecha = parseISO(c.fechaRegistro)
      return isWithinInterval(fecha, {
        start: limites[rango],
        end: ahora,
      })
    })
  }

  const exportarPDF = (datos: Registro[]) => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("Listado de los niños", 14, 20)
    doc.setFontSize(12)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total de registros: ${datos.length}`, 14, 38)

    autoTable(doc, {
      head: [["Nombre", "Edad", "Género", "Escuela", "Sector", "Entregado"]],
      body: datos.map((c) => [c.nombre, c.edad, c.genero || "", c.escuela, c.sector, c.entregado ? "Sí" : "No"]),
      startY: 45,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })
    doc.save(`registros_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const exportarExcel = (datos: Registro[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      datos.map((c) => ({
        Nombre: c.nombre,
        Edad: c.edad,
        Género: c.genero || "",
        Escuela: c.escuela,
        Sector: c.sector,
        Entregado: c.entregado ? "Sí" : "No",
        "Fecha de Registro": c.fechaRegistro ? new Date(c.fechaRegistro).toLocaleDateString() : "",
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros")
    XLSX.writeFile(workbook, `registros_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleExportar = async () => {
    setIsExporting(true)
    try {
      const datos = filtrarPorRango()
      if (formato === "pdf") {
        exportarPDF(datos)
      } else {
        exportarExcel(datos)
      }
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error al exportar:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const datosPreview = filtrarPorRango()
  const rangoLabels: Record<string, string> = {
    "24h": "Últimas 24 horas",
    "7d": "Últimos 7 días",
    "1m": "Último mes",
    "1y": "Último año",
    all: "Todos los registros",
  }

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md modal-content border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="relative pb-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Download className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl text-slate-800">Exportar Registros</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rango de fechas
              </Label>
              <Select value={rango} onValueChange={setRango}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="1m">Último mes</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                  <SelectItem value="all">Todos los registros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Formato de exportación
              </Label>
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview de datos */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Vista previa</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {datosPreview.length} registros
              </Badge>
            </div>
            <div className="text-sm text-slate-600">
              <p>Período: {rangoLabels[rango]}</p>
              <p>Formato: {formato === "excel" ? "Excel" : "PDF"}</p>
            </div>
          </div>

          <Button
            onClick={handleExportar}
            disabled={isExporting || datosPreview.length === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar {datosPreview.length} registros
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
