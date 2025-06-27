"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Patient {
  id: number
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  emergencyContact: string
  medicalHistory: string
  documents: Document[]
}

export interface Appointment {
  id: number
  patientId: number
  patient: string
  time: string
  treatment: string
  status: "scheduled" | "completed"
  cost: number
  notes?: string
  arrivalTime?: string
  date: string
  completedAt?: string
  duration?: string
  paymentMethod?: "cash" | "card" | "transfer"
  paymentStatus?: "paid" | "pending" | "partial"
}

export interface Document {
  id: number
  name: string
  type: "radiography" | "photo" | "document"
  uploadDate: string
  url: string
}

export interface Treatment {
  id: number
  name: string
  defaultCost: number
  description?: string
  duration?: string
}

interface ClinicContextType {
  patients: Patient[]
  appointments: Appointment[]
  treatments: Treatment[]
  addPatient: (patient: Omit<Patient, "id">) => void
  updatePatient: (id: number, patient: Partial<Patient>) => void
  addAppointment: (appointment: Omit<Appointment, "id">) => void
  updateAppointment: (id: number, appointment: Partial<Appointment>) => void
  deleteAppointment: (id: number) => void
  completeAppointment: (
    id: number,
    completionData: {
      completedAt: string
      duration: string
      notes: string
      paymentMethod: "cash" | "card" | "transfer"
      paymentStatus: "paid" | "pending" | "partial"
    },
  ) => void
  addTreatment: (treatment: Omit<Treatment, "id">) => void
  updateTreatment: (id: number, treatment: Partial<Treatment>) => void
  deleteTreatment: (id: number) => void
  getPatientAppointments: (patientId: number) => Appointment[]
  getTodayAppointments: () => Appointment[]
  getCompletedConsultations: () => Appointment[]
  getTodayStats: () => {
    totalPatients: number
    completedConsultations: number
    pendingConsultations: number
    newPatients: number
    returningPatients: number
  }
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "María García",
      email: "maria.garcia@email.com",
      phone: "+1 234 567 8901",
      address: "Calle Principal 123, Ciudad",
      birthDate: "1985-03-15",
      emergencyContact: "+1 234 567 8902",
      medicalHistory: "Alergia a la penicilina. Hipertensión controlada.",
      documents: [
        { id: 1, name: "Radiografía panorámica", type: "radiography", uploadDate: "2024-01-15", url: "#" },
        { id: 2, name: "Foto inicial", type: "photo", uploadDate: "2024-01-15", url: "#" },
      ],
    },
    {
      id: 2,
      name: "Carlos López",
      email: "carlos.lopez@email.com",
      phone: "+1 234 567 8903",
      address: "Avenida Central 456, Ciudad",
      birthDate: "1978-07-22",
      emergencyContact: "+1 234 567 8904",
      medicalHistory: "Sin alergias conocidas. Diabetes tipo 2.",
      documents: [],
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana.martinez@email.com",
      phone: "+1 234 567 8905",
      address: "Plaza Mayor 789, Ciudad",
      birthDate: "1990-11-08",
      emergencyContact: "+1 234 567 8906",
      medicalHistory: "Sin antecedentes médicos relevantes.",
      documents: [],
    },
    {
      id: 4,
      name: "Pedro Rodríguez",
      email: "pedro.rodriguez@email.com",
      phone: "+1 234 567 8907",
      address: "Calle Secundaria 321, Ciudad",
      birthDate: "1982-05-20",
      emergencyContact: "+1 234 567 8908",
      medicalHistory: "Alergia al látex.",
      documents: [],
    },
    {
      id: 5,
      name: "Laura Sánchez",
      email: "laura.sanchez@email.com",
      phone: "+1 234 567 8909",
      address: "Avenida Norte 654, Ciudad",
      birthDate: "1988-09-12",
      emergencyContact: "+1 234 567 8910",
      medicalHistory: "Sin alergias conocidas.",
      documents: [],
    },
    {
      id: 6,
      name: "Miguel Torres",
      email: "miguel.torres@email.com",
      phone: "+1 234 567 8911",
      address: "Calle Sur 987, Ciudad",
      birthDate: "1975-12-03",
      emergencyContact: "+1 234 567 8912",
      medicalHistory: "Hipertensión arterial controlada con medicación.",
      documents: [],
    },
  ])

  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: 1,
      name: "Limpieza dental",
      defaultCost: 250,
      description: "Limpieza y profilaxis dental",
      duration: "45 min",
    },
    { id: 2, name: "Extracción", defaultCost: 400, description: "Extracción dental simple", duration: "30 min" },
    { id: 3, name: "Endodoncia", defaultCost: 800, description: "Tratamiento de conducto", duration: "90 min" },
    { id: 4, name: "Ortodoncia", defaultCost: 600, description: "Ajuste de brackets", duration: "60 min" },
    { id: 5, name: "Implante", defaultCost: 1200, description: "Colocación de implante dental", duration: "120 min" },
    {
      id: 6,
      name: "Blanqueamiento",
      defaultCost: 350,
      description: "Blanqueamiento dental profesional",
      duration: "60 min",
    },
    { id: 7, name: "Empaste", defaultCost: 180, description: "Restauración con resina", duration: "30 min" },
    { id: 8, name: "Control", defaultCost: 100, description: "Consulta de control", duration: "20 min" },
    {
      id: 9,
      name: "Revisión post-extracción",
      defaultCost: 80,
      description: "Control post-operatorio",
      duration: "15 min",
    },
  ])

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patientId: 1,
      patient: "María García",
      time: "09:00",
      treatment: "Limpieza dental",
      status: "completed",
      cost: 250,
      date: "2024-01-27",
      completedAt: "09:45",
      duration: "45 min",
      notes:
        "Limpieza rutinaria completada. Paciente presenta buen estado general de salud bucal. Se recomienda usar hilo dental diariamente.",
      paymentMethod: "card",
      paymentStatus: "paid",
    },
    {
      id: 2,
      patientId: 2,
      patient: "Carlos López",
      time: "09:30",
      treatment: "Extracción",
      status: "completed",
      cost: 400,
      date: "2024-01-27",
      completedAt: "10:00",
      duration: "30 min",
      notes:
        "Extracción de muela del juicio superior derecha. Procedimiento sin complicaciones. Medicación: Ibuprofeno 600mg cada 8 horas por 3 días.",
      paymentMethod: "cash",
      paymentStatus: "paid",
    },
    {
      id: 3,
      patientId: 3,
      patient: "Ana Martínez",
      time: "10:00",
      treatment: "Endodoncia",
      status: "completed",
      cost: 800,
      date: "2024-01-27",
      completedAt: "11:30",
      duration: "90 min",
      notes:
        "Primera sesión de endodoncia en molar inferior izquierdo. Conductos localizados y limpiados. Próxima cita programada para completar tratamiento.",
      paymentMethod: "transfer",
      paymentStatus: "pending",
    },
    {
      id: 4,
      patientId: 4,
      patient: "Pedro Rodríguez",
      time: "10:30",
      treatment: "Ortodoncia",
      status: "completed",
      cost: 600,
      date: "2024-01-27",
      completedAt: "11:30",
      duration: "60 min",
      notes: "Ajuste mensual de brackets. Progreso satisfactorio. Cambio de ligaduras. Próxima cita en 4 semanas.",
      paymentMethod: "card",
      paymentStatus: "paid",
    },
    {
      id: 5,
      patientId: 5,
      patient: "Laura Sánchez",
      time: "11:00",
      treatment: "Implante",
      status: "completed",
      cost: 1200,
      date: "2024-01-27",
      completedAt: "13:00",
      duration: "120 min",
      notes:
        "Colocación de implante dental en posición 36. Procedimiento exitoso. Período de osteointegración: 3-4 meses. Control en 2 semanas.",
      paymentMethod: "cash",
      paymentStatus: "partial",
    },
    {
      id: 6,
      patientId: 6,
      patient: "Miguel Torres",
      time: "14:30",
      treatment: "Blanqueamiento",
      status: "scheduled",
      cost: 350,
      date: "2024-01-27",
    },
    {
      id: 7,
      patientId: 1,
      patient: "María García",
      time: "15:00",
      treatment: "Control",
      status: "scheduled",
      cost: 100,
      date: "2024-01-27",
    },
    {
      id: 8,
      patientId: 2,
      patient: "Carlos López",
      time: "15:30",
      treatment: "Revisión post-extracción",
      status: "scheduled",
      cost: 80,
      date: "2024-01-27",
    },
  ])

  const addPatient = (patientData: Omit<Patient, "id">) => {
    const newPatient = {
      ...patientData,
      id: Math.max(...patients.map((p) => p.id)) + 1,
    }
    setPatients((prev) => [...prev, newPatient])
  }

  const updatePatient = (id: number, patientData: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...patientData } : p)))
  }

  const addAppointment = (appointmentData: Omit<Appointment, "id">) => {
    const newAppointment = {
      ...appointmentData,
      id: Math.max(...appointments.map((a) => a.id)) + 1,
    }
    setAppointments((prev) => [...prev, newAppointment])
  }

  const updateAppointment = (id: number, appointmentData: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...appointmentData } : a)))
  }

  const deleteAppointment = (id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  const completeAppointment = (
    id: number,
    completionData: {
      completedAt: string
      duration: string
      notes: string
      paymentMethod: "cash" | "card" | "transfer"
      paymentStatus: "paid" | "pending" | "partial"
    },
  ) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "completed" as const,
              ...completionData,
            }
          : a,
      ),
    )
  }

  const addTreatment = (treatmentData: Omit<Treatment, "id">) => {
    const newTreatment = {
      ...treatmentData,
      id: Math.max(...treatments.map((t) => t.id)) + 1,
    }
    setTreatments((prev) => [...prev, newTreatment])
  }

  const updateTreatment = (id: number, treatmentData: Partial<Treatment>) => {
    setTreatments((prev) => prev.map((t) => (t.id === id ? { ...t, ...treatmentData } : t)))
  }

  const deleteTreatment = (id: number) => {
    setTreatments((prev) => prev.filter((t) => t.id !== id))
  }

  const getPatientAppointments = (patientId: number) => {
    return appointments.filter((a) => a.patientId === patientId)
  }

  const getTodayAppointments = () => {
    const today = "2024-01-27" // Simulating today's date
    return appointments.filter((a) => a.date === today)
  }

  const getCompletedConsultations = () => {
    return appointments.filter((a) => a.status === "completed")
  }

  const getTodayStats = () => {
    const todayAppointments = getTodayAppointments()
    const completedToday = todayAppointments.filter((a) => a.status === "completed")
    const scheduledToday = todayAppointments.filter((a) => a.status === "scheduled")

    // Get unique patient IDs for today
    const todayPatientIds = todayAppointments.map((a) => a.patientId)
    const uniquePatientIds = [...new Set(todayPatientIds)]

    // Check if patients are new (first appointment ever)
    const newPatients = uniquePatientIds.filter((patientId) => {
      const patientAppointments = appointments.filter((a) => a.patientId === patientId)
      return patientAppointments.length === 1 && todayAppointments.some((a) => a.patientId === patientId)
    })

    return {
      totalPatients: todayAppointments.length,
      completedConsultations: completedToday.length,
      pendingConsultations: scheduledToday.length,
      newPatients: newPatients.length,
      returningPatients: uniquePatientIds.length - newPatients.length,
    }
  }

  return (
    <ClinicContext.Provider
      value={{
        patients,
        appointments,
        treatments,
        addPatient,
        updatePatient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        completeAppointment,
        addTreatment,
        updateTreatment,
        deleteTreatment,
        getPatientAppointments,
        getTodayAppointments,
        getCompletedConsultations,
        getTodayStats,
      }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  const context = useContext(ClinicContext)
  if (context === undefined) {
    throw new Error("useClinic must be used within a ClinicProvider")
  }
  return context
}
