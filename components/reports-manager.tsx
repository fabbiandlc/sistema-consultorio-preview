"use client"

import { useState, useEffect } from "react"
import { BarChart3, Calendar, Download, TrendingUp, Users, DollarSign, CreditCard, Banknote, Smartphone, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinic } from "@/contexts/clinic-context"
import jsPDF from "jspdf"

export default function ReportsManager() {
  const { getCompletedConsultations, getTodayAppointments, updateAppointment } = useClinic()
  const completedConsultations = getCompletedConsultations()
  
  // Calcular la fecha de hoy solo en cliente
  const [today, setToday] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [periodType, setPeriodType] = useState<"day" | "week" | "month">("day")
  
  // Función helper para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const todayDate = getLocalDateString()
    setToday(todayDate)
    setSelectedDate(todayDate)
    
    // Calcular la semana actual (lunes a domingo)
    const currentDate = new Date()
    const dayOfWeek = currentDate.getDay()
    const monday = new Date(currentDate)
    monday.setDate(currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
    const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    setSelectedWeek(mondayStr)
    
    // Calcular el mes y año actual
    const currentYear = currentDate.getFullYear().toString()
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
    setSelectedYear(currentYear)
    setSelectedMonth(currentMonth)
  }, [])

  // Función para obtener las consultas según el período seleccionado
  const getConsultationsForPeriod = () => {
    switch (periodType) {
      case "day":
        // Si no hay fecha seleccionada o es la fecha por defecto, usar la fecha actual
        const currentDate = getLocalDateString()
        const dateToUse = selectedDate || currentDate
        return getTodayAppointments(dateToUse).filter((a) => a.status === "completed")
      case "week":
        // Obtener consultas de la semana seleccionada
        if (!selectedWeek) return []
        const weekStart = new Date(selectedWeek)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        return completedConsultations.filter(consultation => {
          const consultationDate = new Date(consultation.date)
          return consultationDate >= weekStart && consultationDate <= weekEnd
        })
      case "month":
        // Obtener consultas del mes seleccionado
        if (!selectedYear || !selectedMonth) return []
        const monthStart = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1)
        const monthEnd = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0)
        
        return completedConsultations.filter(consultation => {
          const consultationDate = new Date(consultation.date)
          return consultationDate >= monthStart && consultationDate <= monthEnd
        })
      default:
        const defaultDate = getLocalDateString()
        const defaultDateToUse = selectedDate || defaultDate
        return getTodayAppointments(defaultDateToUse).filter((a) => a.status === "completed")
    }
  }

  const periodConsultations = getConsultationsForPeriod()

  // Estadísticas generales (todas las consultas)
  const totalRevenue = completedConsultations.filter((c) => c.paymentStatus === "paid").reduce((sum, c) => sum + c.cost, 0)
  const totalConsultations = completedConsultations.length
  const averagePerConsultation = totalConsultations > 0 ? Math.round(totalRevenue / totalConsultations) : 0
  const pendingPaymentsValue = completedConsultations.filter((c) => c.paymentStatus === "pending").reduce((sum, c) => sum + c.cost, 0)

  // Estadísticas del período seleccionado
  const periodTotal = periodConsultations.filter((c) => c.paymentStatus === "paid").reduce((sum, c) => sum + c.cost, 0)
  const periodPendingTotal = periodConsultations.filter((c) => c.paymentStatus === "pending").reduce((sum, c) => sum + c.cost, 0)
  const periodConsultationCount = periodConsultations.length

  const paymentMethodStats = {
    cash: periodConsultations
      .filter((c) => c.paymentMethod === "cash" && c.paymentStatus === "paid")
      .reduce((sum, c) => sum + c.cost, 0),
    card: periodConsultations
      .filter((c) => c.paymentMethod === "card" && c.paymentStatus === "paid")
      .reduce((sum, c) => sum + c.cost, 0),
    transfer: periodConsultations
      .filter((c) => c.paymentMethod === "transfer" && c.paymentStatus === "paid")
      .reduce((sum, c) => sum + c.cost, 0),
  }

  const treatmentStats = periodConsultations.reduce(
    (acc, consultation) => {
      if (consultation.paymentStatus === "paid") {
        acc[consultation.treatment] = (acc[consultation.treatment] || 0) + consultation.cost
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "transfer":
        return <Smartphone className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "Efectivo"
      case "card":
        return "Tarjeta"
      case "transfer":
        return "Transferencia"
      default:
        return method
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "destructive"
      case "partial":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado"
      case "pending":
        return "Pendiente"
      case "partial":
        return "Parcial"
      default:
        return status
    }
  }

  const updatePaymentStatus = (id: number, status: "paid" | "pending" | "partial") => {
    updateAppointment(id, { paymentStatus: status })
  }

  const exportReport = () => {
    const doc = new jsPDF()
    
    // Configuración inicial
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const lineHeight = 7
    let yPosition = margin
    
    // Título del reporte
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Reporte de Consultorio", pageWidth / 2, yPosition, { align: "center" })
    yPosition += lineHeight * 2
    
    // Información del período
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`Período: ${getPeriodDisplayName()}`, margin, yPosition)
    yPosition += lineHeight * 1.5
    
    // Fecha de generación
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Generado el: ${currentDate}`, margin, yPosition)
    yPosition += lineHeight * 2
    
    // Estadísticas principales
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Estadísticas Principales", margin, yPosition)
    yPosition += lineHeight * 1.5
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`• Ingresos del período: $${periodTotal}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Consultas realizadas: ${periodConsultationCount}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Promedio por consulta: $${averagePerConsultation}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Pagos pendientes: $${periodPendingTotal}`, margin + 10, yPosition)
    yPosition += lineHeight * 2
    
    // Resumen financiero
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Resumen Financiero", margin, yPosition)
    yPosition += lineHeight * 1.5
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const totalFacturado = periodTotal + periodPendingTotal
    const efectividadCobro = totalFacturado > 0 ? Math.round((periodTotal / totalFacturado) * 100) : 0
    
    doc.text(`• Total facturado: $${totalFacturado}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Total cobrado: $${periodTotal}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Por cobrar: $${periodPendingTotal}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Efectividad de cobro: ${efectividadCobro}%`, margin + 10, yPosition)
    yPosition += lineHeight * 2
    
    // Desglose por método de pago
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Desglose por Método de Pago", margin, yPosition)
    yPosition += lineHeight * 1.5
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`• Efectivo: $${paymentMethodStats.cash}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Tarjeta: $${paymentMethodStats.card}`, margin + 10, yPosition)
    yPosition += lineHeight
    doc.text(`• Transferencia: $${paymentMethodStats.transfer}`, margin + 10, yPosition)
    yPosition += lineHeight * 2
    
    // Desglose por tratamiento
    if (Object.keys(treatmentStats).length > 0) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Desglose por Tratamiento", margin, yPosition)
      yPosition += lineHeight * 1.5
      
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      Object.entries(treatmentStats).forEach(([treatment, amount]) => {
        doc.text(`• ${treatment}: $${amount}`, margin + 10, yPosition)
        yPosition += lineHeight
      })
      yPosition += lineHeight
    }
    
    // Verificar si necesitamos una nueva página para la tabla de consultas
    if (periodConsultations.length > 0 && yPosition > 250) {
      doc.addPage()
      yPosition = margin
    }
    
    // Tabla de consultas detalladas
    if (periodConsultations.length > 0) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Consultas Detalladas", margin, yPosition)
      yPosition += lineHeight * 1.5
      
      // Encabezados de la tabla
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      const tableHeaders = ["Paciente", "Fecha", "Hora", "Tratamiento", "Costo", "Método", "Estado"]
      const columnWidths = [40, 25, 20, 35, 25, 25, 25]
      let xPosition = margin
      
      tableHeaders.forEach((header, index) => {
        doc.text(header, xPosition, yPosition)
        xPosition += columnWidths[index]
      })
      yPosition += lineHeight
      
      // Línea separadora
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
      yPosition += lineHeight
      
      // Datos de la tabla
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      
      periodConsultations.forEach((consultation, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 270) {
          doc.addPage()
          yPosition = margin
          
          // Repetir encabezados en nueva página
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          xPosition = margin
          tableHeaders.forEach((header, headerIndex) => {
            doc.text(header, xPosition, yPosition)
            xPosition += columnWidths[headerIndex]
          })
          yPosition += lineHeight
          doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
          yPosition += lineHeight
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
        }
        
        xPosition = margin
        doc.text(consultation.patient.substring(0, 15), xPosition, yPosition)
        xPosition += columnWidths[0]
        
        doc.text(consultation.date, xPosition, yPosition)
        xPosition += columnWidths[1]
        
        doc.text(consultation.time, xPosition, yPosition)
        xPosition += columnWidths[2]
        
        doc.text(consultation.treatment.substring(0, 12), xPosition, yPosition)
        xPosition += columnWidths[3]
        
        doc.text(`$${consultation.cost}`, xPosition, yPosition)
        xPosition += columnWidths[4]
        
        doc.text(getPaymentMethodText(consultation.paymentMethod).substring(0, 8), xPosition, yPosition)
        xPosition += columnWidths[5]
        
        doc.text(getPaymentStatusText(consultation.paymentStatus), xPosition, yPosition)
        
        yPosition += lineHeight
      })
    }
    
    // Pie de página
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" })
    }
    
    // Descargar el PDF
    const fileName = `reporte_consultorio_${getPeriodDisplayName().replace(/[^a-zA-Z0-9]/g, '_')}_${getLocalDateString()}.pdf`
    doc.save(fileName)
  }

  const getPeriodDisplayName = () => {
    switch (periodType) {
      case "day":
        return ""
      case "week":
        if (!selectedWeek) return "Semana: No seleccionada"
        const weekStart = new Date(selectedWeek)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `Semana: ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      case "month":
        if (!selectedYear || !selectedMonth) return "Mes: No seleccionado"
        const monthName = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        return `Mes: ${monthName}`
      default:
        return ""
    }
  }

  // Función para generar los años disponibles
  const generateAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    
    // Generar años desde el actual hasta 2 años atrás
    for (let year = currentYear; year >= currentYear - 2; year--) {
      years.push(year.toString())
    }
    
    return years
  }

  const availableYears = generateAvailableYears()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 sm:mb-4">
        <div>
          <span className="text-lg font-semibold">{getPeriodDisplayName()}</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
          <Select value={periodType} onValueChange={(value: "day" | "week" | "month") => setPeriodType(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Día específico</SelectItem>
              <SelectItem value="week">Semana específica</SelectItem>
              <SelectItem value="month">Mes específico</SelectItem>
            </SelectContent>
          </Select>
          
          {periodType === "day" && (
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-40"
            />
          )}
          
          {periodType === "week" && (
            <Input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full sm:w-40"
            />
          )}
          
          {periodType === "month" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2 w-full sm:w-auto">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Enero</SelectItem>
                  <SelectItem value="02">Febrero</SelectItem>
                  <SelectItem value="03">Marzo</SelectItem>
                  <SelectItem value="04">Abril</SelectItem>
                  <SelectItem value="05">Mayo</SelectItem>
                  <SelectItem value="06">Junio</SelectItem>
                  <SelectItem value="07">Julio</SelectItem>
                  <SelectItem value="08">Agosto</SelectItem>
                  <SelectItem value="09">Septiembre</SelectItem>
                  <SelectItem value="10">Octubre</SelectItem>
                  <SelectItem value="11">Noviembre</SelectItem>
                  <SelectItem value="12">Diciembre</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-24">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button variant="outline" onClick={exportReport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ingresos del Período</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">${periodTotal}</div>
            <p className="text-xs text-muted-foreground">
              {periodConsultationCount} consultas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Consultas del Período</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{periodConsultationCount}</div>
            <p className="text-xs text-muted-foreground">Total del período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Promedio por Consulta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">${averagePerConsultation}</div>
            <p className="text-xs text-muted-foreground">Valor promedio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pagos Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">${periodPendingTotal}</div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="pending">Pagos Pendientes</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Resumen financiero del período */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumen Financiero del Período</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Facturado</span>
                  <span className="font-medium">${periodTotal + periodPendingTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Cobrado</span>
                  <span className="font-medium">${periodTotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Por Cobrar</span>
                  <span className="font-medium text-destructive">${periodPendingTotal}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Efectividad de Cobro</span>
                  <span className="font-medium">
                    {periodTotal + periodPendingTotal > 0 
                      ? Math.round((periodTotal / (periodTotal + periodPendingTotal)) * 100) 
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desglose por Método de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    <span className="text-sm">Efectivo</span>
                  </div>
                  <span className="font-medium">${paymentMethodStats.cash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">Tarjeta</span>
                  </div>
                  <span className="font-medium">${paymentMethodStats.card}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Transferencia</span>
                  </div>
                  <span className="font-medium">${paymentMethodStats.transfer}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desglose por Tratamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(treatmentStats).map(([treatment, amount]) => (
                    <div key={treatment} className="flex items-center justify-between">
                      <span className="text-sm">{treatment}</span>
                      <span className="font-medium">${amount}</span>
                    </div>
                  ))}
                  {Object.keys(treatmentStats).length === 0 && (
                    <div className="text-center text-muted-foreground text-sm">
                      Sin tratamientos registrados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista detallada de consultas del período */}
          <Card>
            <CardHeader>
              <CardTitle>Consultas del Período</CardTitle>
              <CardDescription>Lista detallada con información de facturación</CardDescription>
            </CardHeader>
            <CardContent>
              {periodConsultations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No hay consultas completadas en este período
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodConsultations.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell className="font-medium">{consultation.patient}</TableCell>
                        <TableCell>{consultation.date}</TableCell>
                        <TableCell>{consultation.time}</TableCell>
                        <TableCell>{consultation.treatment}</TableCell>
                        <TableCell>${consultation.cost}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(consultation.paymentMethod)}
                            <span className="text-sm">{getPaymentMethodText(consultation.paymentMethod)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={consultation.paymentStatus}
                            onValueChange={(value: "paid" | "pending" | "partial") =>
                              updatePaymentStatus(consultation.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Pagado</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="partial">Parcial</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  )
}
