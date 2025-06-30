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

export default function DentalClinicSystem() {
  const [activeTab, setActiveTab] = useState("agenda")

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-2">
            <TabsTrigger value="agenda" className="text-xs sm:text-sm">Agenda</TabsTrigger>
            <TabsTrigger value="patients" className="text-xs sm:text-sm">Pacientes</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Historial</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reportes</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Tratamientos</TabsTrigger>
          </TabsList>

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
