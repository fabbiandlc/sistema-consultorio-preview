import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClinicProvider } from "@/contexts/clinic-context"
import ClientWrapper from "@/components/client-wrapper"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="es" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
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
