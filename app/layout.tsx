import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClinicProvider } from "@/contexts/clinic-context"
import ClientWrapper from "@/components/client-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Sistema Consultorio Odontológico",
  description: "Sistema completo para gestión de consultorio dental",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientWrapper>
            <ClinicProvider>{children}</ClinicProvider>
          </ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
