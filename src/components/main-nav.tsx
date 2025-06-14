"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ClipboardList, UserPlus } from "lucide-react"

interface MainNavProps {
  className?: string
  isMobile?: boolean
  onItemClick?: () => void
}

export function MainNav({ className, isMobile, onItemClick }: MainNavProps) {
  const pathname = usePathname()

  const links = [
    {
      href: "/dashboard",
      label: "Inicio",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/registro",
      label: "Registro",
      icon: UserPlus,
      active: pathname === "/dashboard/registro",
    },
    {
      href: "/dashboard/lista",
      label: "Lista",
      icon: ClipboardList,
      active: pathname.includes("/dashboard/lista"),
    },
  ]

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-2 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 animate-slide-in",
              "border border-transparent",
              link.active ? "bg-white/20 text-white shadow-lg" : "hover:bg-white/10 text-white/90 hover:text-white",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                link.active ? "bg-white text-blue-600 shadow-md" : "bg-white/10 text-white hover:bg-white/20",
              )}
            >
              <link.icon className="h-5 w-5" />
            </div>
            <span className="font-medium">{link.label}</span>
            {link.active && <div className="absolute right-3 w-2 h-2 rounded-full bg-white shadow-sm animate-pulse" />}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className={cn("flex items-center space-x-2", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          title={link.label}
          className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover-lift group",
            link.active ? "text-white bg-white/20 shadow-lg" : "text-white/80 hover:text-white hover:bg-white/10",
          )}
        >
          <link.icon className="h-5 w-5" />
          {link.active && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
          )}

          {/* Tooltip */}
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {link.label}
          </div>
        </Link>
      ))}
    </nav>
  )
}
