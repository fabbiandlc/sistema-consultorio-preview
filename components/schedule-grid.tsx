"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar } from "lucide-react"
import { Appointment } from "@/lib/database"

interface ScheduleGridProps {
  date: string
  appointments: Appointment[]
  onTimeSelect: (time: string) => void
  selectedTime?: string
  selectedDuration?: number
  className?: string
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  date,
  appointments,
  onTimeSelect,
  selectedTime,
  selectedDuration,
  className = ""
}) => {
  // Generar huecos de 15 minutos desde las 7:00 AM hasta las 10:00 PM
  const generateTimeSlots = () => {
    const slots = []
    const startHour = 7 // 7:00 AM
    const endHour = 22 // 10:00 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()
  
  // Obtener citas del día seleccionado
  const dayAppointments = appointments.filter(appointment => appointment.date === date)
  
  // Verificar si un hueco está ocupado
  const isSlotOccupied = (time: string) => {
    return dayAppointments.some(appointment => appointment.time === time)
  }

  // Verificar si un hueco está en conflicto con la duración seleccionada
  const isSlotInConflict = (time: string) => {
    if (!selectedDuration || selectedDuration <= 15) return false
    
    const durationInMinutes = selectedDuration
    const slotsNeeded = Math.ceil(durationInMinutes / 15)
    
    // Verificar si hay citas en los slots que se necesitan
    for (let i = 0; i < slotsNeeded; i++) {
      const checkTime = addMinutesToTime(time, i * 15)
      if (isSlotOccupied(checkTime)) return true
    }
    
    return false
  }

  // Verificar si un hueco está en conflicto con citas existentes
  const isSlotInConflictWithExisting = (time: string) => {
    // Verificar si este slot se solapa con alguna cita existente
    return dayAppointments.some(appointment => {
      const appointmentTime = appointment.time
      const appointmentDuration = parseInt(appointment.duration || "15")
      const appointmentSlots = Math.ceil(appointmentDuration / 15)
      
      // Verificar si el slot actual está dentro del rango de la cita existente
      for (let i = 0; i < appointmentSlots; i++) {
        const appointmentSlotTime = addMinutesToTime(appointmentTime, i * 15)
        if (appointmentSlotTime === time) return true
      }
      
      return false
    })
  }

  // Función auxiliar para sumar minutos a una hora
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    
    // Si pasa de las 10 PM, no está disponible
    if (newHours >= 22) return "22:00"
    
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  // Verificar si un hueco está disponible (no ocupado y no en el pasado si es hoy)
  const isSlotAvailable = (time: string) => {
    // Si está ocupado, no está disponible
    if (isSlotOccupied(time)) return false
    
    // Si hay conflicto con la duración seleccionada, no está disponible
    if (isSlotInConflict(time)) return false
    
    // Si hay conflicto con citas existentes, no está disponible
    if (isSlotInConflictWithExisting(time)) return false
    
    // Si es hoy, verificar que no sea una hora pasada
    const today = new Date().toISOString().split('T')[0]
    if (date === today) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const [slotHour, slotMinute] = time.split(':').map(Number)
      
      // Si la hora del slot es menor que la hora actual, no está disponible
      if (slotHour < currentHour) return false
      
      // Si es la misma hora pero los minutos del slot son menores, no está disponible
      if (slotHour === currentHour && slotMinute <= currentMinute) return false
    }
    
    return true
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (!date) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma del día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Selecciona una fecha para ver los huecos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  const availableSlots = timeSlots.filter(isSlotAvailable)
  const occupiedSlots = timeSlots.filter(isSlotOccupied)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Cronograma - {new Date(date).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {availableSlots.length} huecos disponibles • {occupiedSlots.length} ocupados
          <div className="text-xs mt-1">
            Horario: 7:00 AM - 10:00 PM • Huecos de 15 minutos
          </div>
          {selectedDuration && selectedDuration > 15 && (
            <div className="text-xs mt-1">
              Duración seleccionada: {selectedDuration} min - Se verifican solapamientos
            </div>
          )}
          {dayAppointments.some(a => parseInt(a.duration || "15") > 15) && (
            <div className="text-xs mt-1">
              Citas con duración extendida - Se verifican solapamientos
            </div>
          )}
          {date === new Date().toISOString().split('T')[0] && (
            <div className="text-xs mt-1">
              Hoy - Solo se muestran horas futuras
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
          {timeSlots.map((time) => {
            const isAvailable = isSlotAvailable(time)
            const isOccupied = isSlotOccupied(time)
            const isSelected = selectedTime === time
            const isConflict = isSlotInConflict(time)
            const isConflictWithExisting = isSlotInConflictWithExisting(time)
            const isPast = (() => {
              const today = new Date().toISOString().split('T')[0]
              if (date === today) {
                const now = new Date()
                const currentHour = now.getHours()
                const currentMinute = now.getMinutes()
                const [slotHour, slotMinute] = time.split(':').map(Number)
                return slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)
              }
              return false
            })()
            
            return (
              <Button
                key={time}
                variant={isSelected ? "default" : (isOccupied || isConflict || isConflictWithExisting) ? "destructive" : isPast ? "secondary" : "outline"}
                size="sm"
                className={`h-12 text-xs ${
                  (isOccupied || isConflict || isConflictWithExisting)
                    ? "cursor-not-allowed opacity-60" 
                    : isPast
                      ? "cursor-not-allowed opacity-40"
                      : isAvailable 
                        ? "cursor-pointer hover:bg-primary hover:text-primary-foreground" 
                        : "cursor-not-allowed opacity-40"
                }`}
                onClick={() => isAvailable && onTimeSelect(time)}
                disabled={!isAvailable}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">{formatTime(time)}</span>
                  {(isOccupied || isConflict || isConflictWithExisting) && (
                    <span className="text-xs opacity-75">Ocupado</span>
                  )}
                  {isPast && !isOccupied && !isConflict && !isConflictWithExisting && (
                    <span className="text-xs opacity-75">Pasado</span>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
        
        {availableSlots.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No hay huecos disponibles para este día
          </div>
        )}
      </CardContent>
    </Card>
  )
} 