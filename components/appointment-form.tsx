"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { Appointment, Patient, Treatment } from "@/lib/database"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScheduleGrid } from "@/components/schedule-grid"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ComboboxOption {
  label: string
  value: string
}

interface AppointmentFormProps {
  appointment?: Appointment | null
  patients: Patient[]
  treatments: Treatment[]
  appointments: Appointment[]
  onSubmit: (appointmentData: Partial<Appointment>) => void
  onCancel: () => void
  isLoading?: boolean
  addPatient?: (patient: Omit<Patient, "id">) => Promise<number>
  selectedDate?: string
}

function parseDateLocal(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export default function AppointmentForm({
  appointment,
  patients,
  treatments,
  appointments,
  onSubmit,
  onCancel,
  isLoading = false,
  addPatient,
  selectedDate
}: AppointmentFormProps) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || 0,
    patient: appointment?.patient || "",
    date: appointment?.date || selectedDate || "",
    time: appointment?.time || "",
    treatment: appointment?.treatment || "",
    cost: appointment?.cost || 0,
    notes: appointment?.notes || "",
    duration: appointment?.duration || "",
    paymentMethod: appointment?.paymentMethod || "cash" as const,
    paymentStatus: appointment?.paymentStatus || "pending" as const
  })

  // Estado para el diálogo de nuevo paciente
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    emergencyContact: "",
    medicalHistory: ""
  })

  // Estado para los combobox
  const [selectedPatient, setSelectedPatient] = useState<ComboboxOption | null>(
    appointment ? { label: appointment.patient, value: (appointment.patientId || 0).toString() } : null
  )
  const [selectedTreatment, setSelectedTreatment] = useState<ComboboxOption | null>(
    appointment ? { label: appointment.treatment, value: "" } : null
  )

  // Sincronizar el estado del formulario cuando cambia la prop appointment
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || 0,
        patient: appointment.patient || "",
        date: appointment.date || "",
        time: appointment.time || "",
        treatment: appointment.treatment || "",
        cost: appointment.cost || 0,
        notes: appointment.notes || "",
        duration: appointment.duration || "",
        paymentMethod: appointment.paymentMethod || "cash",
        paymentStatus: appointment.paymentStatus || "pending"
      })
      
      setSelectedPatient({ 
        label: appointment.patient || "", 
        value: (appointment.patientId || 0).toString() 
      })
      setSelectedTreatment({ 
        label: appointment.treatment || "", 
        value: "" 
      })
    } else {
      // Resetear el formulario cuando no hay appointment (nueva cita)
      setFormData({
        patientId: 0,
        patient: "",
        date: selectedDate || "",
        time: "",
        treatment: "",
        cost: 0,
        notes: "",
        duration: "15",
        paymentMethod: "cash",
        paymentStatus: "pending"
      })
      setSelectedPatient(null)
      setSelectedTreatment(null)
    }
  }, [appointment, selectedDate])

  // Opciones para los combobox
  const patientOptions: ComboboxOption[] = patients.map(patient => ({
    label: patient.name,
    value: patient.id.toString()
  }))

  const treatmentOptions: ComboboxOption[] = treatments.map(treatment => ({
    label: `${treatment.name} - $${treatment.defaultCost}`,
    value: treatment.id.toString()
  }))

  // Actualizar formData cuando cambian las selecciones
  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patient: selectedPatient.label,
        patientId: parseInt(selectedPatient.value) || 0
      }))
    }
  }, [selectedPatient])

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }))
  }

  // Función para verificar conflictos de horarios
  const checkTimeConflicts = () => {
    if (!formData.time || !formData.date || !formData.duration) return null
    
    const duration = parseInt(formData.duration)
    const slotsNeeded = Math.ceil(duration / 15)
    
    // Función auxiliar para sumar minutos a una hora
    const addMinutesToTime = (time: string, minutes: number): string => {
      const [hours, mins] = time.split(':').map(Number)
      const totalMinutes = hours * 60 + mins + minutes
      const newHours = Math.floor(totalMinutes / 60)
      const newMins = totalMinutes % 60
      
      if (newHours >= 22) return "22:00"
      return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
    }
    
    // Verificar cada slot que necesita la cita
    for (let i = 0; i < slotsNeeded; i++) {
      const checkTime = addMinutesToTime(formData.time, i * 15)
      
      // Verificar si hay una cita exacta en este horario
      const conflictingAppointment = appointments.find(existingAppointment => 
        existingAppointment.date === formData.date && 
        existingAppointment.time === checkTime &&
        existingAppointment.id !== (appointment?.id || 0) // Excluir la cita actual si estamos editando
      )
      
      if (conflictingAppointment) {
        return {
          time: checkTime,
          patient: conflictingAppointment.patient,
          message: `Conflicto: Ya existe una cita a las ${checkTime} para ${conflictingAppointment.patient}`
        }
      }
      
      // Verificar si este slot se solapa con alguna cita existente
      const overlappingAppointment = appointments.find(existingAppointment => {
        if (existingAppointment.date !== formData.date || existingAppointment.id === (appointment?.id || 0)) return false
        
        const appointmentDuration = parseInt(existingAppointment.duration || "15")
        const appointmentSlots = Math.ceil(appointmentDuration / 15)
        
        // Verificar si el slot actual está dentro del rango de la cita existente
        for (let j = 0; j < appointmentSlots; j++) {
          const appointmentSlotTime = addMinutesToTime(existingAppointment.time, j * 15)
          if (appointmentSlotTime === checkTime) return true
        }
        
        return false
      })
      
      if (overlappingAppointment) {
        return {
          time: checkTime,
          patient: overlappingAppointment.patient,
          message: `Conflicto: Se solapa con la cita de ${overlappingAppointment.patient} (${overlappingAppointment.time} - ${overlappingAppointment.duration} min)`
        }
      }
    }
    
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar conflictos antes de enviar
    const conflict = checkTimeConflicts()
    if (conflict) {
      alert(`Error: ${conflict.message}`)
      return
    }
    
    onSubmit(formData)
  }

  const handlePatientSelect = (option: ComboboxOption) => {
    // Si el paciente no existe en la lista, mostrar diálogo para crear
    const existingPatient = patients.find(p => p.name === option.label)
    if (!existingPatient && option.label.trim() !== "" && option.value !== "new") {
      setNewPatientData({ ...newPatientData, name: option.label })
      setShowNewPatientDialog(true)
    } else if (option.value === "new") {
      setShowNewPatientDialog(true)
    } else {
      setSelectedPatient(option)
      setFormData(prev => ({
        ...prev,
        patient: option.label,
        patientId: parseInt(option.value)
      }))
    }
  }

  const handleTreatmentSelect = (option: ComboboxOption) => {
    setSelectedTreatment(option)
    
    // Extraer solo el nombre del tratamiento (sin el costo)
    const treatmentName = option.label.split(' - ')[0]
    
    setFormData(prev => ({ 
      ...prev, 
      treatment: treatmentName
    }))
    
    // Si es un tratamiento existente, actualizar el costo automáticamente
    const existingTreatment = treatments.find(t => t.name === treatmentName)
    if (existingTreatment) {
      setFormData(prev => ({ 
        ...prev, 
        treatment: treatmentName,
        cost: existingTreatment.defaultCost 
      }))
    }
  }

  const handleCreatePatient = async () => {
    try {
      if (!addPatient) {
        console.error("addPatient function not provided")
        return
      }
      
      const patientData = {
        name: newPatientData.name,
        email: newPatientData.email || "",
        phone: newPatientData.phone || "",
        address: newPatientData.address || "",
        birthDate: newPatientData.birthDate || null,
        emergencyContact: newPatientData.emergencyContact || "",
        medicalHistory: newPatientData.medicalHistory || ""
      }
      
      const newPatientId = await addPatient(patientData)
      
      // Actualizar el formulario con el nuevo paciente
      setFormData(prev => ({
        ...prev,
        patient: newPatientData.name,
        patientId: newPatientId
      }))
      
      setSelectedPatient({
        label: newPatientData.name,
        value: newPatientId.toString()
      })
      
      setShowNewPatientDialog(false)
      setNewPatientData({
        name: "",
        email: "",
        phone: "",
        address: "",
        birthDate: "",
        emergencyContact: "",
        medicalHistory: ""
      })
    } catch (error) {
      console.error("Error al crear paciente:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      patientId: 0,
      patient: "",
      date: "",
      time: "",
      treatment: "",
      cost: 0,
      notes: "",
      duration: "15",
      paymentMethod: "cash",
      paymentStatus: "pending"
    })
    setSelectedPatient(null)
    setSelectedTreatment(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="patient" className="text-right">
            Paciente
          </Label>
          <div className="col-span-3">
            <Combobox
              options={patientOptions}
              onSelect={handlePatientSelect}
              placeholder="Buscar o agregar paciente"
              allowCustom={true}
              value={selectedPatient?.label || ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Fecha
          </Label>
          <div className="col-span-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={"w-full justify-start text-left font-normal px-3 py-1 text-sm"}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date
                    ? format(parseDateLocal(formData.date), "EEEE, d 'de' MMMM", { locale: es })
                    : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? parseDateLocal(formData.date) : undefined}
                  onSelect={date => {
                    if (date) {
                      setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="time" className="text-right">
            Hora
          </Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="treatment" className="text-right">
            Tratamiento
          </Label>
          <div className="col-span-3">
            <Combobox
              options={treatmentOptions}
              onSelect={handleTreatmentSelect}
              placeholder="Buscar o agregar tratamiento"
              allowCustom={true}
              value={selectedTreatment?.label || ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cost" className="text-right">
            Costo
          </Label>
          <Input
            id="cost"
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
            placeholder="0"
            className="col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="duration" className="text-right">
            Duración
          </Label>
          <Select
            value={formData.duration}
            onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecciona la duración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 hora 30 minutos</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="paymentMethod" className="text-right">
            Método de pago
          </Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value: "cash" | "card" | "transfer") => 
              setFormData(prev => ({ ...prev, paymentMethod: value }))
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue />
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
          <Select
            value={formData.paymentStatus}
            onValueChange={(value: "paid" | "pending" | "partial") => 
              setFormData(prev => ({ ...prev, paymentStatus: value }))
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue />
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
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observaciones adicionales"
            className="col-span-3"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {checkTimeConflicts() && (
            <div className="flex-1 text-sm text-destructive flex items-center gap-2">
              ⚠️ {checkTimeConflicts()?.message}
            </div>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !formData.patient || !formData.treatment || !formData.date || !formData.time || checkTimeConflicts() !== null}
            title={checkTimeConflicts()?.message || ""}
          >
            {isLoading ? "Guardando..." : appointment ? "Guardar cambios" : "Crear cita"}
          </Button>
        </div>
      </form>

      {/* Cronograma */}
      <ScheduleGrid
        date={formData.date}
        appointments={appointments}
        onTimeSelect={handleTimeSelect}
        selectedTime={formData.time}
        selectedDuration={parseInt(formData.duration) || 15}
        className="h-fit"
      />

      {/* Diálogo para crear nuevo paciente */}
      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo paciente que se agregará al sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPatientName">Nombre completo *</Label>
                <Input 
                  id="newPatientName" 
                  value={newPatientData.name}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del paciente" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPatientBirthDate">Fecha de nacimiento</Label>
                <Input 
                  id="newPatientBirthDate" 
                  type="date" 
                  value={newPatientData.birthDate}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPatientEmail">Email</Label>
                <Input 
                  id="newPatientEmail" 
                  type="email" 
                  value={newPatientData.email}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Correo electrónico" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPatientPhone">Teléfono</Label>
                <Input 
                  id="newPatientPhone" 
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 8900" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPatientAddress">Dirección</Label>
              <Input 
                id="newPatientAddress" 
                value={newPatientData.address}
                onChange={(e) => setNewPatientData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Dirección completa" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPatientEmergencyContact">Contacto de emergencia</Label>
              <Input 
                id="newPatientEmergencyContact" 
                value={newPatientData.emergencyContact}
                onChange={(e) => setNewPatientData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="+1 234 567 8900" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPatientMedicalHistory">Historia médica</Label>
              <Textarea 
                id="newPatientMedicalHistory" 
                value={newPatientData.medicalHistory}
                onChange={(e) => setNewPatientData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                placeholder="Alergias, medicamentos, condiciones médicas..." 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewPatientDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreatePatient} disabled={!newPatientData.name}>
              Crear paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 