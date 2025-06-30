"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import AgendaManager from "@/components/agenda-manager"
import PatientManager from "@/components/patient-manager"
import ReportsManager from "@/components/reports-manager"
import ConsultationHistory from "@/components/consultation-history"
import SettingsManager from "@/components/settings-manager"
import { useClinic } from "@/contexts/clinic-context"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DentalClinicSystem() {
  const [activeTab, setActiveTab] = useState("agenda")
  const isMobile = useIsMobile()
  const tabOptions = [
    { value: "agenda", label: "Agenda" },
    { value: "patients", label: "Pacientes" },
    { value: "history", label: "Historial" },
    { value: "reports", label: "Reportes" },
    { value: "settings", label: "Tratamientos" },
  ]

  return (
    <DashboardLayout mobileTabsMenu={isMobile ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-md border bg-muted" aria-label="Abrir menú de pestañas">
            <Menu className="h-6 w-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {tabOptions.map(tab => (
            <DropdownMenuItem key={tab.value} onClick={() => setActiveTab(tab.value)}>
              {tab.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null}>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-8">
        <div className="mb-2 sm:mb-4" />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {isMobile ? (
            <div className="flex items-center mb-2 relative">
              <span className="flex-1 text-center w-full text-2xl font-semibold">
                {tabOptions.find(t => t.value === activeTab)?.label}
              </span>
            </div>
          ) : (
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-2">
              {tabOptions.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          )}

          <TabsContent value="agenda" className="space-y-4">
            <AgendaManager />
          </TabsContent>

          <TabsContent value="patients">
            <PatientManager />
          </TabsContent>

          <TabsContent value="history">
            <ConsultationHistory />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManager />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
