"use client"

import { useState } from "react"
import { Calendar, Clock, Plus, Edit, ArrowUp, ArrowDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { useClinic } from "@/contexts/clinic-context"

interface Appointment {
  id: number
  patient: string
  time: string
  treatment: string
  status: "scheduled" | "completed"
  cost: number
  notes?: string
  arrivalTime?: string
}

export default function AgendaManager() {
  const {
    appointments,
    updateAppointment,
    completeAppointment,
    getTodayAppointments,
    patients,
    treatments,
    deleteAppointment,
  } = useClinic()

  const todayAppointments = getTodayAppointments()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "secondary"
      case "completed":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programada"
      case "completed":
        return "Completada"
      default:
        return status
    }
  }

  const updateAppointmentStatus = (id: number, newStatus: "scheduled" | "completed") => {
    if (newStatus === "completed") {
      // Open completion dialog instead of directly updating
      const appointment = todayAppointments.find((a) => a.id === id)
      if (appointment) {
        completeAppointment(id, {
          completedAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          duration: "45 min", // Default duration
          notes: "Consulta completada satisfactoriamente",
          paymentMethod: "cash",
          paymentStatus: "paid",
        })
      }
    } else {
      updateAppointment(id, { status: newStatus })
    }
  }

  const moveAppointment = (id: number, direction: "up" | "down") => {
    setLocalAppointments((prev) => {
      const index = prev.findIndex((apt) => apt.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev

      const newAppointments = [...prev]
      const temp = newAppointments[index]
      newAppointments[index] = newAppointments[newIndex]
      newAppointments[newIndex] = temp

      return newAppointments
    })
  }

  const scheduledAppointments = todayAppointments
    .filter((apt) => apt.status === "scheduled")
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestión de Agenda</h3>
          <p className="text-sm text-muted-foreground">Administra las citas y cola de espera del día</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
              <DialogDescription>
                {editingAppointment ? "Modifica los datos de la cita" : "Programa una nueva cita para el paciente"}
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
                <Label htmlFor="time" className="text-right">
                  Hora
                </Label>
                <Input id="time" type="time" className="col-span-3" />
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
                <Label htmlFor="notes" className="text-right">
                  Notas
                </Label>
                <Textarea id="notes" placeholder="Observaciones adicionales" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                {editingAppointment ? "Guardar cambios" : "Crear cita"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda del Día
              </CardTitle>
              <CardDescription>Vista completa de todas las citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium w-16">{appointment.time}</div>
                      <div className="flex-1">
                        <div className="font-medium">{appointment.patient}</div>
                        <div className="text-sm text-muted-foreground">{appointment.treatment}</div>
                        <div className="text-sm font-medium">${appointment.cost}</div>
                        {appointment.arrivalTime && (
                          <div className="text-xs text-muted-foreground">Llegó: {appointment.arrivalTime}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>

                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveAppointment(appointment.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveAppointment(appointment.id, "down")}
                          disabled={index === localAppointments.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <Select
                        value={appointment.status}
                        onValueChange={(value: Appointment["status"]) => updateAppointmentStatus(appointment.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Programada</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAppointment(appointment)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`¿Eliminar la cita de ${appointment.patient}?`)) {
                            deleteAppointment(appointment.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Citas Programadas
              </CardTitle>
              <CardDescription>Próximas citas del día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay citas programadas</p>
                ) : (
                  scheduledAppointments.map((appointment, index) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{appointment.patient}</div>
                          <div className="text-xs text-muted-foreground">Hora: {appointment.time}</div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                        Completar
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
