import { supabase } from './supabaseClient'

// Utilidad para convertir camelCase a snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        typeof v === 'object' && v !== null ? toSnakeCase(v) : v
      ])
    )
  }
  return obj
}
// Utilidad para convertir snake_case a camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, l) => l.toUpperCase()),
        typeof v === 'object' && v !== null ? toCamelCase(v) : v
      ])
    )
  }
  return obj
}

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
  status: 'scheduled' | 'completed'
  cost: number
  notes?: string
  arrivalTime?: string
  date: string
  completedAt?: string
  duration?: string
  paymentMethod?: 'cash' | 'card' | 'transfer'
  paymentStatus?: 'paid' | 'pending' | 'partial'
}

export interface Document {
  id: number
  name: string
  type: 'radiography' | 'photo' | 'document'
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

export const db = {
  // Pacientes
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase.from('patients').select('*')
    if (error) throw error
    return toCamelCase(data || [])
  },
  async addPatient(patient: Omit<Patient, 'id'>): Promise<number> {
    const snakeCasePatient = toSnakeCase(patient)
    const { data, error } = await supabase.from('patients').insert([snakeCasePatient]).select('id')
    
    if (error) {
      console.error("db.addPatient - Error de Supabase:", error)
      throw error
    }
    
    if (!data || !data[0] || !data[0].id) {
      console.error("db.addPatient - No se recibió ID válido:", data)
      throw new Error("No se pudo crear el paciente - ID no válido")
    }
    
    return data[0].id
  },
  async updatePatient(id: number, patient: Partial<Patient>): Promise<void> {
    const { error } = await supabase.from('patients').update(toSnakeCase(patient)).eq('id', id)
    if (error) throw error
  },
  async deletePatient(id: number): Promise<void> {
    const { error } = await supabase.from('patients').delete().eq('id', id)
    if (error) throw error
  },

  // Citas
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*')
    if (error) throw error
    return toCamelCase(data || [])
  },
  async addAppointment(appointment: Omit<Appointment, 'id'>): Promise<number> {
    const { data, error } = await supabase.from('appointments').insert([toSnakeCase(appointment)]).select('id')
    if (error) throw error
    return data?.[0]?.id
  },
  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<void> {
    const { error } = await supabase.from('appointments').update(toSnakeCase(appointment)).eq('id', id)
    if (error) throw error
  },
  async deleteAppointment(id: number): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) throw error
  },

  // Tratamientos
  async getTreatments(): Promise<Treatment[]> {
    const { data, error } = await supabase.from('treatments').select('*')
    if (error) throw error
    return toCamelCase(data || [])
  },
  async addTreatment(treatment: Omit<Treatment, 'id'>): Promise<number> {
    const { data, error } = await supabase.from('treatments').insert([toSnakeCase(treatment)]).select('id')
    if (error) throw error
    return data?.[0]?.id
  },
  async updateTreatment(id: number, treatment: Partial<Treatment>): Promise<void> {
    const { error } = await supabase.from('treatments').update(toSnakeCase(treatment)).eq('id', id)
    if (error) throw error
  },
  async deleteTreatment(id: number): Promise<void> {
    const { error } = await supabase.from('treatments').delete().eq('id', id)
    if (error) throw error
  },
} 