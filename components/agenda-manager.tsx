"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, Edit, ArrowUp, ArrowDown, Trash2, Users, FileText } from "lucide-react"
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
import AppointmentForm from "@/components/appointment-form"
import DateNavigator from "@/components/date-navigator"
import { Appointment } from "@/lib/database"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function AgendaManager() {
  const {
    appointments,
    updateAppointment,
    completeAppointment,
    getTodayAppointments,
    patients,
    treatments,
    deleteAppointment,
    addAppointment,
    addPatient,
    addTreatment,
  } = useClinic()

  // Estado para la fecha seleccionada
  const [selectedDate, setSelectedDate] = useState(new Date())
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd')

  const todayAppointments = getTodayAppointments(selectedDateString)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Actualizar localAppointments cuando cambian las citas
  useEffect(() => {
    setLocalAppointments(appointments)
  }, [appointments])

  // Limpiar editingAppointment cuando se cierra el diálogo
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingAppointment(null)
    }
  }, [isDialogOpen])

  // Use useEffect to set current time only on client side
  useEffect(() => {
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }))
  }, [])

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
          completedAt: currentTime || "00:00", // Use currentTime or fallback
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

  const handleSubmitAppointment = async (appointmentData: Partial<Appointment>) => {
    setIsLoading(true)
    try {
      if (editingAppointment) {
        // Actualizar cita existente
        await updateAppointment(editingAppointment.id, appointmentData)
      } else {
        // Crear nueva cita
        // Verificar si el paciente existe, si no, crearlo
        let patientId = appointmentData.patientId
        if (!patientId && appointmentData.patient) {
          const newPatientId = await addPatient({
            name: appointmentData.patient,
            email: "",
            phone: "",
            address: "",
            birthDate: "",
            emergencyContact: "",
            medicalHistory: ""
          })
          patientId = newPatientId
        }

        // Verificar si el tratamiento existe, si no, crearlo
        let treatmentId = 0
        if (appointmentData.treatment) {
          const existingTreatment = treatments.find(t => t.name === appointmentData.treatment)
          if (!existingTreatment) {
            treatmentId = await addTreatment({
              name: appointmentData.treatment,
              defaultCost: appointmentData.cost || 0
            })
          }
        }

        await addAppointment({
          patientId: patientId || 0,
          patient: appointmentData.patient || "",
          date: appointmentData.date || selectedDateString,
          time: appointmentData.time || "",
          treatment: appointmentData.treatment || "",
          status: "scheduled",
          cost: appointmentData.cost || 0,
          notes: appointmentData.notes || "",
          duration: appointmentData.duration || "",
          paymentMethod: appointmentData.paymentMethod || "cash",
          paymentStatus: appointmentData.paymentStatus || "pending"
        })
      }
      
      setIsDialogOpen(false)
      setEditingAppointment(null)
    } catch (error: any) {
      alert(error?.message || JSON.stringify(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingAppointment(null)
  }

  const scheduledAppointments = todayAppointments
    .filter((apt) => apt.status === "scheduled")
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 sm:mb-4">
        <DateNavigator 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="text-sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
              <DialogDescription>
                {editingAppointment ? "Modifica los datos de la cita" : "Programa una nueva cita para el paciente"}
              </DialogDescription>
            </DialogHeader>
            
            <AppointmentForm
              appointment={editingAppointment}
              patients={patients}
              treatments={treatments}
              appointments={appointments}
              onSubmit={handleSubmitAppointment}
              onCancel={handleCancel}
              isLoading={isLoading}
              addPatient={addPatient}
              selectedDate={selectedDateString}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                ? "Pacientes Hoy" 
                : `Pacientes ${format(selectedDate, 'd/M/yyyy')}`}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter(a => a.status === "completed").length} completadas, {todayAppointments.filter(a => a.status === "scheduled").length} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Consultas Completadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{todayAppointments.filter(a => a.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">De {todayAppointments.length} programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pacientes Restantes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{todayAppointments.filter(a => a.status === "scheduled").length}</div>
            <p className="text-xs text-muted-foreground">Citas programadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                  ? "Agenda del Día" 
                  : `Agenda del ${format(selectedDate, 'd/M/yyyy')}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
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

                    <div className="flex flex-wrap items-center gap-2">
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
                {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                  ? "Citas Programadas" 
                  : `Citas del ${format(selectedDate, 'd/M/yyyy')}`}
              </CardTitle>
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

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments
              .filter(a => a.status === "completed")
              .slice(0, 5)
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{appointment.patient}</div>
                    <div className="text-sm text-muted-foreground">{appointment.treatment}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Consulta completada</div>
                    <div className="text-xs text-muted-foreground">{appointment.completedAt || appointment.time}</div>
                  </div>
                </div>
              ))}
            {appointments.filter(a => a.status === "completed").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
