import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClinicProvider } from "@/contexts/clinic-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema Consultorio Odontológico",
  description: "Sistema completo para gestión de consultorio dental",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClinicProvider>{children}</ClinicProvider>
      </body>
    </html>
  )
}
