"use client"

import { useState } from "react"
import { BarChart3, Calendar, Download, TrendingUp, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinic } from "@/contexts/clinic-context"

export default function ReportsManager() {
  const { getCompletedConsultations, getTodayStats } = useClinic()
  const completedConsultations = getCompletedConsultations()
  const todayStats = getTodayStats()

  // Calcular valores reales
  const totalRevenue = completedConsultations.filter((c) => c.paymentStatus === "paid").reduce((sum, c) => sum + c.cost, 0)
  const totalConsultations = completedConsultations.length
  const averagePerConsultation = totalConsultations > 0 ? Math.round(totalRevenue / totalConsultations) : 0
  const pendingPaymentsValue = completedConsultations.filter((c) => c.paymentStatus === "pending").reduce((sum, c) => sum + c.cost, 0)

  const [reportPeriod, setReportPeriod] = useState("week")

  const exportReport = (type: string) => {
    // Función para exportar reportes
    console.log(`Exportando reporte ${type}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Reportes y Análisis</h3>
          <p className="text-sm text-muted-foreground">Análisis detallado de ingresos, consultas y tendencias</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">+12% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations}</div>
            <p className="text-xs text-muted-foreground">+8% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Consulta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePerConsultation}</div>
            <p className="text-xs text-muted-foreground">+3% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPaymentsValue}</div>
            <p className="text-xs text-muted-foreground">4 pacientes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos vs Meta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalRevenue / 15000) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Meta: $15,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">Efectividad de cobro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas/Día</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalConsultations / 5)}</div>
            <p className="text-xs text-muted-foreground">Promedio diario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Paciente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePerConsultation}</div>
            <p className="text-xs text-muted-foreground">Promedio por visita</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="pending">Pagos Pendientes</TabsTrigger>
          <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {reportPeriod === "week" ? "Desglose Diario" : "Desglose Semanal"}
                </CardTitle>
                <CardDescription>Ingresos y consultas por {reportPeriod === "week" ? "día" : "semana"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center text-muted-foreground">
                  Sin datos disponibles
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Distribución de pagos recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center text-muted-foreground">
                  Sin datos disponibles
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes con Pagos Pendientes</CardTitle>
              <CardDescription>Lista de pacientes con facturas por cobrar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Sin datos disponibles</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle>Consultas Más Frecuentes</CardTitle>
              <CardDescription>Tratamientos más realizados en el período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Sin datos disponibles</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Ingresos</CardTitle>
                <CardDescription>Evolución de ingresos en los últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">Sin datos disponibles</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promedio de Ingresos por Día</CardTitle>
                <CardDescription>Comparación con períodos anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">Sin datos disponibles</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
