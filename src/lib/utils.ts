import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind helpers
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Limpiar inputs con referencia
export function limpiarInputs(formRef: React.RefObject<HTMLFormElement>) {
  if (formRef.current) formRef.current.reset()
}

// Verifica si hay conexión
export function isOnline(): boolean {
  return typeof window !== "undefined" && navigator.onLine
}

// Eliminar clave de localStorage
export function eliminarLocal(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error eliminando de localStorage:", error)
  }
}

// Guardar datos localmente con tipo genérico
export function guardarLocalmente<T>(clave: string, data: T): void {
  try {
    if (typeof window !== "undefined") {
      const serializado = JSON.stringify(data)
      localStorage.setItem(clave, serializado)
    }
  } catch (error) {
    console.error(`Error guardando en localStorage [${clave}]:`, error)
  }
}

// Obtener datos locales con protección contra errores de parseo
export function obtenerLocal<T>(clave: string): T | null {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(clave)
      return raw ? (JSON.parse(raw) as T) : null
    }
  } catch (error) {
    console.error(`Error leyendo localStorage [${clave}]:`, error)
  }
  return null
}

// Tipos adicionales (si decides mantenerlos aquí)
export interface Child {
  nombre: string
  edad: number
}

// Alias específicos (si aún se usan en alguna parte)
export function saveLocalChildren(children: Child[]): void {
  guardarLocalmente("localChildren", children)
}

export function getLocalChildren(): Child[] {
  return obtenerLocal<Child[]>("localChildren") || []
}
