"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronDown, Download, Loader2 } from "lucide-react"
import { getAuth, signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

interface UserNavProps {
  isMobile?: boolean
  className?: string
  onExportClick: () => void
}

export function UserNav({ onExportClick }: UserNavProps) {
  const auth = getAuth()
  const router = useRouter()
  const user = auth.currentUser
  const email = user?.email ?? ""
  const displayName = user?.displayName ?? (email ? email.split("@")[0] : "Usuario")
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      localStorage.removeItem("usuarioActual")
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-10 pl-2 pr-3 rounded-full border-white/20 bg-white/10 hover:bg-white/20 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Avatar className="h-7 w-7 border-2 border-white/30">
            {user?.photoURL ? (
              <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-white text-blue-600 text-xs font-semibold">{initials}</AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm font-medium text-white max-w-[80px] truncate hidden sm:block">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-white/80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 mt-2 p-0 bg-white border border-slate-200 rounded-xl shadow-2xl dropdown-content"
        align="end"
        forceMount
      >
        {/* Header del usuario */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <Avatar className="h-12 w-12 border-2 border-white/30">
            {user?.photoURL ? (
              <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-white text-blue-600 font-semibold">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-white/80 truncate max-w-[160px]">{email}</p>
          </div>
        </div>

        {/* Opciones del menú */}
        <div className="p-2">
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => handleNavigation("/dashboard/perfil")}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-700">Mi Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={onExportClick}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
              <Download className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-700">Exportar Datos</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-200" />

        {/* Cerrar sesión */}
        <div className="p-2">
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 transition-colors text-red-600"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            </div>
            <span className="font-medium">{isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
