"use client"

import { useState } from "react"
import { History, Search, Filter, Eye, Calendar, User, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useClinic } from "@/contexts/clinic-context"

interface CompletedConsultation {
  id: number
  patient: string
  date: string
  time: string
  treatment: string
  cost: number
  duration: string
  notes: string
  paymentStatus: "paid" | "pending" | "partial"
  paymentMethod: "cash" | "card" | "transfer"
  completedAt: string
}

export default function ConsultationHistory() {
  const { getCompletedConsultations, deleteAppointment } = useClinic()
  const consultations = getCompletedConsultations()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterTreatment, setFilterTreatment] = useState("")
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("")
  const [selectedConsultation, setSelectedConsultation] = useState<CompletedConsultation | null>(null)

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

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      (consultation.patient?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (consultation.treatment?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())

    const matchesDate = !filterDate || (consultation.date ?? "") === filterDate
    const matchesTreatment = !filterTreatment || (consultation.treatment ?? "") === filterTreatment
    const matchesPaymentStatus = !filterPaymentStatus || (consultation.paymentStatus ?? "") === filterPaymentStatus

    return matchesSearch && matchesDate && matchesTreatment && matchesPaymentStatus
  })

  const uniqueTreatments = [...new Set(consultations.map((c) => c.treatment ?? ""))]

  const todayConsultations: CompletedConsultation[] = []
  const uniquePatients = new Set(consultations.map((c) => c.patient ?? "")).size
  const averageDuration =
    consultations.length > 0
      ? Math.round(
          consultations.reduce((sum, c) => {
            const duration = Number.parseInt((c.duration?.split(" ")[0] ?? "45"))
            return sum + duration
          }, 0) / consultations.length,
        )
      : 0

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Paciente o tratamiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterDate">Fecha</Label>
              <Input id="filterDate" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterTreatment">Tratamiento</Label>
              <Select value={filterTreatment} onValueChange={setFilterTreatment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tratamientos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tratamientos</SelectItem>
                  {uniqueTreatments.map((treatment) => (
                    <SelectItem key={treatment} value={treatment}>
                      {treatment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterPaymentStatus">Estado de Pago</Label>
              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterDate("")
                  setFilterTreatment("")
                  setFilterPaymentStatus("")
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Completo</CardTitle>
          <CardDescription>
            Mostrando {filteredConsultations.length} de {consultations.length} consultas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell>{consultation.date ?? ""}</TableCell>
                  <TableCell>{consultation.time ?? ""}</TableCell>
                  <TableCell>{consultation.patient ?? ""}</TableCell>
                  <TableCell>{consultation.treatment ?? ""}</TableCell>
                  <TableCell>{consultation.duration ?? ""}</TableCell>
                  <TableCell>${consultation.cost ?? 0}</TableCell>
                  <TableCell>{getPaymentMethodText(consultation.paymentMethod ?? "cash")}</TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusColor(consultation.paymentStatus ?? "pending")}>
                      {getPaymentStatusText(consultation.paymentStatus ?? "pending")}
                    </Badge>
                  </TableCell>
                  <TableCell>{consultation.status ?? ""}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedConsultation({
                            id: consultation.id,
                            patient: consultation.patient ?? "",
                            date: consultation.date ?? "",
                            time: consultation.time ?? "",
                            treatment: consultation.treatment ?? "",
                            cost: consultation.cost ?? 0,
                            duration: consultation.duration ?? "",
                            notes: consultation.notes ?? "",
                            paymentStatus: consultation.paymentStatus ?? "pending",
                            paymentMethod: consultation.paymentMethod ?? "cash",
                            completedAt: consultation.completedAt ?? ""
                          })}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Detalles de la Consulta</DialogTitle>
                            <DialogDescription>
                              {consultation.patient} - {consultation.date} {consultation.time}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Paciente</Label>
                                <p className="text-sm text-muted-foreground">{consultation.patient}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Tratamiento</Label>
                                <p className="text-sm text-muted-foreground">{consultation.treatment}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Fecha y Hora</Label>
                                <p className="text-sm text-muted-foreground">
                                  {consultation.date} - {consultation.time}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Duración</Label>
                                <p className="text-sm text-muted-foreground">{consultation.duration}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Costo</Label>
                                <p className="text-sm text-muted-foreground">${consultation.cost}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Método de Pago</Label>
                                <p className="text-sm text-muted-foreground">
                                  {getPaymentMethodText(consultation.paymentMethod ?? "cash")}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Estado de Pago</Label>
                                <Badge variant={getPaymentStatusColor(consultation.paymentStatus ?? "pending")}>
                                  {getPaymentStatusText(consultation.paymentStatus ?? "pending")}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Completada a las</Label>
                                <p className="text-sm text-muted-foreground">{consultation.completedAt}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Notas de la Consulta</Label>
                              <Textarea value={consultation.notes ?? ""} readOnly className="mt-2 min-h-[100px]" />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`¿Eliminar la consulta de ${consultation.patient}?`)) {
                            deleteAppointment(consultation.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
