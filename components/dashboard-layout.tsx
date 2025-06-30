import type React from "react"
import ThemeToggle from "@/components/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
