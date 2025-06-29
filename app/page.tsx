"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import AgendaManager from "@/components/agenda-manager"
import PatientManager from "@/components/patient-manager"
import BillingManager from "@/components/billing-manager"
import ReportsManager from "@/components/reports-manager"
import ConsultationHistory from "@/components/consultation-history"
import SettingsManager from "@/components/settings-manager"
import { useClinic } from "@/contexts/clinic-context"

export default function DentalClinicSystem() {
  const [activeTab, setActiveTab] = useState("agenda")

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
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

          <TabsContent value="billing">
            <BillingManager />
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
