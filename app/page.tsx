"use client"

import { useState } from "react"
import { Users, FileText, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/dashboard-layout"
import AgendaManager from "@/components/agenda-manager"
import PatientManager from "@/components/patient-manager"
import BillingManager from "@/components/billing-manager"
import ReportsManager from "@/components/reports-manager"
import ConsultationHistory from "@/components/consultation-history"
import SettingsManager from "@/components/settings-manager"
import { useClinic } from "@/contexts/clinic-context"

export default function DentalClinicSystem() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { getTodayStats, getTodayAppointments } = useClinic()

  const todayStats = getTodayStats()
  const todayAppointments = getTodayAppointments()

  // Get upcoming scheduled appointments
  const upcomingAppointments = todayAppointments.filter((apt) => apt.status === "scheduled").slice(0, 3)

  // Get recent activity from completed appointments
  const recentActivity = todayAppointments
    .filter((apt) => apt.status === "completed")
    .slice(-3)
    .map((apt) => ({
      id: apt.id,
      patient: apt.patient,
      action: "Consulta completada",
      time: apt.completedAt || apt.time,
      treatment: apt.treatment,
    }))

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Sistema Consultorio Odontológico</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Hoy</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    {todayStats.completedConsultations} completadas, {todayStats.pendingConsultations} pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultas Completadas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.completedConsultations}</div>
                  <p className="text-xs text-muted-foreground">De {todayStats.totalPatients} programadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Restantes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.pendingConsultations}</div>
                  <p className="text-xs text-muted-foreground">Citas programadas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                  <CardDescription>Agenda del día actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay citas programadas pendientes
                      </p>
                    ) : (
                      upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="font-medium">{appointment.time}</div>
                            <div>
                              <div className="font-medium">{appointment.patient}</div>
                              <div className="text-sm text-muted-foreground">{appointment.treatment}</div>
                            </div>
                          </div>
                          <Badge variant="secondary">Programada</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas consultas completadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente</p>
                    ) : (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{activity.patient}</div>
                            <div className="text-sm text-muted-foreground">{activity.treatment}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{activity.action}</div>
                            <div className="text-xs text-muted-foreground">{activity.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agenda">
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
