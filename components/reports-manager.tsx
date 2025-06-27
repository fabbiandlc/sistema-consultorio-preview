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

  // Calcular datos reales
  const weeklyRevenue = completedConsultations
    .filter((c) => c.paymentStatus === "paid")
    .reduce((sum, c) => sum + c.cost, 0)

  const pendingPaymentsValue = completedConsultations
    .filter((c) => c.paymentStatus === "pending")
    .reduce((sum, c) => sum + c.cost, 0)

  const [reportPeriod, setReportPeriod] = useState("week")

  // Datos de ejemplo para reportes
  const weeklyData = {
    totalRevenue: 8450,
    totalConsultations: 28,
    averagePerConsultation: 302,
    pendingPayments: 1200,
    dailyBreakdown: [
      { day: "Lunes", consultations: 6, revenue: 1800 },
      { day: "Martes", consultations: 5, revenue: 1250 },
      { day: "Miércoles", consultations: 4, revenue: 1100 },
      { day: "Jueves", consultations: 7, revenue: 2100 },
      { day: "Viernes", consultations: 6, revenue: 2200 },
    ],
  }

  const monthlyData = {
    totalRevenue: 34200,
    totalConsultations: 112,
    averagePerConsultation: 305,
    pendingPayments: 4800,
    weeklyBreakdown: [
      { week: "Semana 1", consultations: 28, revenue: 8450 },
      { week: "Semana 2", consultations: 32, revenue: 9600 },
      { week: "Semana 3", consultations: 26, revenue: 7800 },
      { week: "Semana 4", consultations: 26, revenue: 8350 },
    ],
  }

  const currentData = reportPeriod === "week" ? weeklyData : monthlyData

  const pendingPayments = [
    { patient: "Ana Martínez", treatment: "Endodoncia", amount: 800, daysOverdue: 5 },
    { patient: "Miguel Torres", treatment: "Blanqueamiento", amount: 350, daysOverdue: 2 },
    { patient: "Carmen Ruiz", treatment: "Implante", amount: 1200, daysOverdue: 10 },
    { patient: "Roberto Silva", treatment: "Ortodoncia", amount: 600, daysOverdue: 1 },
  ]

  const frequentTreatments = [
    { treatment: "Limpieza dental", count: 45, percentage: 40.2 },
    { treatment: "Empastes", count: 28, percentage: 25.0 },
    { treatment: "Extracciones", count: 18, percentage: 16.1 },
    { treatment: "Endodoncia", count: 12, percentage: 10.7 },
    { treatment: "Ortodoncia", count: 9, percentage: 8.0 },
  ]

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
            <div className="text-2xl font-bold">${currentData.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">+12% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalConsultations}</div>
            <p className="text-xs text-muted-foreground">+8% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Consulta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.averagePerConsultation}</div>
            <p className="text-xs text-muted-foreground">+3% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.pendingPayments}</div>
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
            <div className="text-2xl font-bold">{Math.round((currentData.totalRevenue / 15000) * 100)}%</div>
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
            <div className="text-2xl font-bold">{Math.round(currentData.totalConsultations / 5)}</div>
            <p className="text-xs text-muted-foreground">Promedio diario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Paciente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.averagePerConsultation}</div>
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
                <div className="space-y-4">
                  {(reportPeriod === "week" ? currentData.dailyBreakdown : currentData.weeklyBreakdown).map(
                    (item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{reportPeriod === "week" ? item.day : item.week}</div>
                          <div className="text-sm text-muted-foreground">{item.consultations} consultas</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.revenue}</div>
                          <div className="text-sm text-muted-foreground">
                            ${Math.round(item.revenue / item.consultations)} promedio
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Distribución de pagos recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efectivo</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tarjeta</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transferencia</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tratamiento</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Días de Atraso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{payment.patient}</TableCell>
                      <TableCell>{payment.treatment}</TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell>{payment.daysOverdue} días</TableCell>
                      <TableCell>
                        <Badge variant={payment.daysOverdue > 7 ? "destructive" : "secondary"}>
                          {payment.daysOverdue > 7 ? "Vencido" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Contactar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <div className="space-y-4">
                {frequentTreatments.map((treatment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{treatment.treatment}</div>
                      <div className="text-sm text-muted-foreground">{treatment.count} consultas</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${treatment.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12">{treatment.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enero</span>
                    <span className="font-medium">$28,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Febrero</span>
                    <span className="font-medium">$31,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marzo</span>
                    <span className="font-medium">$34,200</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-4">Crecimiento promedio: +9.8% mensual</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promedio de Ingresos por Día</CardTitle>
                <CardDescription>Comparación con períodos anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lunes</span>
                    <span className="font-medium">$1,850</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Martes</span>
                    <span className="font-medium">$1,650</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Miércoles</span>
                    <span className="font-medium">$1,420</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Jueves</span>
                    <span className="font-medium">$2,100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Viernes</span>
                    <span className="font-medium">$2,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
