import type React from "react"
import ThemeToggle from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Menu, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  mobileTabsMenu?: React.ReactNode
}

export default function DashboardLayout({ children, mobileTabsMenu }: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const username = userEmail ? userEmail.split("@")[0] : "Usuario"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-14 sm:h-16 items-center px-2 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-muted/60 transition text-base font-semibold">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>{username}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
