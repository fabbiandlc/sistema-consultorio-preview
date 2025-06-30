import type React from "react"
import ThemeToggle from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface DashboardLayoutProps {
  children: React.ReactNode
  mobileTabsMenu?: React.ReactNode
}

export default function DashboardLayout({ children, mobileTabsMenu }: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-14 sm:h-16 items-center px-2 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
          </div>

          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {isMobile && mobileTabsMenu}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
