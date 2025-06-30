"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { db } from "@/lib/database"

export interface Patient {
  id: number
  name: string
  email: string
  phone: string
  address: string
  birthDate?: string | null
  emergencyContact: string
  medicalHistory: string
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
  addPatient: (patient: Omit<Patient, "id">) => Promise<number>
  updatePatient: (id: number, patient: Partial<Patient>) => void
  deletePatient: (id: number) => void
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
  addTreatment: (treatment: Omit<Treatment, "id">) => Promise<number>
  updateTreatment: (id: number, treatment: Partial<Treatment>) => void
  deleteTreatment: (id: number) => void
  getPatientAppointments: (patientId: number) => Appointment[]
  getTodayAppointments: (today?: string) => Appointment[]
  getCompletedConsultations: () => Appointment[]
  getTodayStats: (today?: string) => {
    totalPatients: number
    completedConsultations: number
    pendingConsultations: number
    newPatients: number
    returningPatients: number
  }
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // await db.init() // Ya no es necesario con Supabase
      const loadedPatients = await db.getPatients()
      const loadedTreatments = await db.getTreatments()
      const loadedAppointments = await db.getAppointments()
      setPatients(loadedPatients)
      setTreatments(loadedTreatments)
      setAppointments(loadedAppointments)
      setLoading(false)
    }
    loadData()
  }, [])

  const addPatient = async (patientData: Omit<Patient, "id">) => {
    const id = await db.addPatient(patientData)
    setPatients(await db.getPatients())
    return id
  }

  const updatePatient = async (id: number, patientData: Partial<Patient>) => {
    await db.updatePatient(id, patientData)
    setPatients(await db.getPatients())
  }

  const deletePatient = async (id: number) => {
    await db.deletePatient(id)
    setPatients(await db.getPatients())
  }

  const addAppointment = async (appointmentData: Omit<Appointment, "id">) => {
    await db.addAppointment(appointmentData)
    setAppointments(await db.getAppointments())
  }

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    await db.updateAppointment(id, appointmentData)
    setAppointments(await db.getAppointments())
  }

  const deleteAppointment = async (id: number) => {
    await db.deleteAppointment(id)
    setAppointments(await db.getAppointments())
  }

  const completeAppointment = async (
    id: number,
    completionData: {
      completedAt: string
      duration: string
      notes: string
      paymentMethod: "cash" | "card" | "transfer"
      paymentStatus: "paid" | "pending" | "partial"
    },
  ) => {
    await db.updateAppointment(id, { ...completionData, status: "completed" })
    setAppointments(await db.getAppointments())
  }

  const addTreatment = async (treatmentData: Omit<Treatment, "id">) => {
    const id = await db.addTreatment(treatmentData)
    setTreatments(await db.getTreatments())
    return id
  }

  const updateTreatment = async (id: number, treatmentData: Partial<Treatment>) => {
    await db.updateTreatment(id, treatmentData)
    setTreatments(await db.getTreatments())
  }

  const deleteTreatment = async (id: number) => {
    await db.deleteTreatment(id)
    setTreatments(await db.getTreatments())
  }

  const getPatientAppointments = (patientId: number) => appointments.filter(a => a.patientId === patientId)
  /**
   * Devuelve las citas del día recibido. Si no se pasa 'today', retorna [].
   * Esto evita errores de hidratación SSR/CSR.
   */
  const getTodayAppointments = (today?: string) => {
    if (!today) return []
    return appointments.filter(a => a.date === today)
  }
  const getCompletedConsultations = () => appointments.filter(a => a.status === "completed")
  /**
   * Devuelve estadísticas del día recibido. Si no se pasa 'today', retorna ceros.
   */
  const getTodayStats = (today?: string) => {
    const todayAppointments = getTodayAppointments(today)
    const totalPatients = todayAppointments.length
    const completedConsultations = todayAppointments.filter(a => a.status === "completed").length
    const pendingConsultations = todayAppointments.filter(a => a.status === "scheduled").length
    return {
      totalPatients,
      completedConsultations,
      pendingConsultations,
      newPatients: 0,
      returningPatients: 0,
    }
  }

  if (loading) {
    return <div style={{padding: 32, textAlign: 'center'}}>Cargando datos del consultorio...</div>
  }

  return (
    <ClinicContext.Provider
      value={{
        patients,
        appointments,
        treatments,
        addPatient,
        updatePatient,
        deletePatient,
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
