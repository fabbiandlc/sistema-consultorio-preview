"use client"

import { useState } from "react"
import { DollarSign, CreditCard, Banknote, Smartphone, Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useClinic } from "@/contexts/clinic-context"

interface Consultation {
  id: number
  patient: string
  date: string
  time: string
  treatment: string
  cost: number
  paymentMethod: "cash" | "card" | "transfer"
  paymentStatus: "paid" | "pending" | "partial"
  notes?: string
  status: "scheduled" | "completed" | "cancelled"
}

export default function BillingManager() {
  const { getTodayAppointments, updateAppointment, treatments } = useClinic()
  const consultations = getTodayAppointments().filter((a) => a.status === "completed")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null)

  const todayTotal = consultations.filter((c) => c.paymentStatus === "paid").reduce((sum, c) => sum + c.cost, 0)

  const pendingTotal = consultations.filter((c) => c.paymentStatus === "pending").reduce((sum, c) => sum + c.cost, 0)

  const consultationCount = consultations.length

  const paymentMethodStats = {
    cash: consultations
      .filter((c) => c.paymentMethod === "cash" && c.paymentStatus === "paid")
      .reduce((sum, c) => sum + c.cost, 0),
    card: consultations
      .filter((c) => c.paymentMethod === "card" && c.paymentStatus === "paid")
      .reduce((sum, c) => sum + c.cost, 0),
    transfer: consultations
      .filter((c) => c.paymentMethod === "transfer" && c.paymentStatus === "paid")
      .reduce((sum, c) => sum + c.cost, 0),
  }

  const treatmentStats = consultations.reduce(
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Sistema de Facturación</h3>
          <p className="text-sm text-muted-foreground">Gestiona pagos y genera reportes de consultas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingConsultation ? "Editar Consulta" : "Nueva Consulta"}</DialogTitle>
              <DialogDescription>
                {editingConsultation
                  ? "Modifica los datos de la consulta"
                  : "Registra una nueva consulta y su facturación"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patient" className="text-right">
                  Paciente
                </Label>
                <Input id="patient" placeholder="Nombre del paciente" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="treatment" className="text-right">
                  Tratamiento
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.name}>
                        {treatment.name} - ${treatment.defaultCost}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Costo
                </Label>
                <Input id="cost" type="number" placeholder="0" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                  Método de pago
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentStatus" className="text-right">
                  Estado de pago
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notas
                </Label>
                <Textarea id="notes" placeholder="Observaciones adicionales" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                {editingConsultation ? "Guardar cambios" : "Registrar consulta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen del día */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Día</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayTotal}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: ${consultationCount > 0 ? Math.round(todayTotal / consultationCount) : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultationCount}</div>
            <p className="text-xs text-muted-foreground">Total del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingTotal}</div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentMethodStats.cash}</div>
            <p className="text-xs text-muted-foreground">En efectivo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen Financiero del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Facturado</span>
              <span className="font-medium">${todayTotal + pendingTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Cobrado</span>
              <span className="font-medium">${todayTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Por Cobrar</span>
              <span className="font-medium text-destructive">${pendingTotal}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-medium">Efectividad de Cobro</span>
              <span className="font-medium">{Math.round((todayTotal / (todayTotal + pendingTotal)) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Promedio por Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Consultas Pagadas</span>
              <span className="font-medium">
                $
                {consultationCount > 0
                  ? Math.round(todayTotal / consultations.filter((c) => c.paymentStatus === "paid").length)
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Todas las Consultas</span>
              <span className="font-medium">
                ${consultationCount > 0 ? Math.round((todayTotal + pendingTotal) / consultationCount) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Meta Diaria</span>
              <span className="font-medium">$3,000</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="font-medium">{Math.round((todayTotal / 3000) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pagos Completos</span>
              <span className="font-medium text-green-600">
                {consultations.filter((c) => c.paymentStatus === "paid").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pagos Pendientes</span>
              <span className="font-medium text-red-600">
                {consultations.filter((c) => c.paymentStatus === "pending").length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pagos Parciales</span>
              <span className="font-medium text-yellow-600">
                {consultations.filter((c) => c.paymentStatus === "partial").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por método de pago */}
      <div className="grid gap-4 md:grid-cols-3">
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

        <Card className="md:col-span-2">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista detallada de consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Detallada de Consultas</CardTitle>
          <CardDescription>Todas las consultas del día con información de facturación</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell className="font-medium">{consultation.patient}</TableCell>
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
                      onValueChange={(value: Consultation["paymentStatus"]) =>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingConsultation(consultation)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
