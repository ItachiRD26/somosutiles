import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SyncListener from "@/components/synclistener"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TODOS SOMOS UTILES",
  description: "Sistema de gestión para la distribución de útiles escolares",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <SyncListener />
      </head>
      <body className={inter.className + " flex flex-col min-h-screen"}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <main className="flex-1">{children}</main>

          <footer className="text-center py-4 bg-slate-100 text-slate-600 text-sm">
            Desarrollado por{" "}
            <a
              href="https://api.whatsapp.com/send/?phone=18099616343"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold"
            >
              Jeter_Dev
            </a>
          </footer>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
