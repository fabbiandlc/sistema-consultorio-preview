"use client"

import { useState, useEffect } from "react"
import { User, Plus, Search, FileText, Upload, Eye, Calendar, DollarSign, FileImage, Edit, Trash2, Save, X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinic } from "@/contexts/clinic-context"
import { Patient } from "@/lib/database"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"

interface Consultation {
  id: number
  date: string
  treatment: string
  cost: number
  notes: string
  paymentStatus: "paid" | "pending" | "partial"
}

export default function PatientManager() {
  const { patients, getPatientAppointments, addPatient, updatePatient, deletePatient } = useClinic()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Patient>>({})
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState("info")
  const tabOptions = [
    { value: "info", label: "Información" },
    { value: "history", label: "Historial" },
    { value: "billing", label: "Facturación" },
  ]

  // Estado local para el formulario de nuevo paciente
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    medicalHistory: ""
  })

  const resetForm = () => setForm({
    name: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    medicalHistory: ""
  })

  const handleCreatePatient = async () => {
    if (!form.name) return
    await addPatient({
      name: form.name,
      birthDate: form.birthDate || null,
      email: form.email || "",
      phone: form.phone || "",
      address: form.address || "",
      emergencyContact: form.emergencyContact || "",
      medicalHistory: form.medicalHistory || ""
    })
    setIsNewPatientDialogOpen(false)
    resetForm()
  }

  const handleEditField = (field: string, value: string) => {
    setEditingField(field)
    setEditForm({ [field]: value })
  }

  const handleSaveEdit = async () => {
    if (selectedPatient && editingField) {
      await updatePatient(selectedPatient.id, editForm)
      setEditingField(null)
      setEditForm({})
      // Actualizar inmediatamente el paciente seleccionado con los nuevos datos
      setSelectedPatient({
        ...selectedPatient,
        ...editForm
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditForm({})
  }

  const handleDeletePatient = async (patientId: number) => {
    await deletePatient(patientId)
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(null)
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      (patient.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (patient.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (patient.phone ?? "").includes(searchTerm),
  )

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

  const renderEditableField = (field: string, label: string, value: string | null | undefined, type: string = "text") => {
    const isEditing = editingField === field
    const currentValue = value || "No especificado"
    
    return (
      <div className="flex items-center justify-between group">
        <div className="flex-1">
          <Label className="text-sm font-medium">{label}</Label>
          {isEditing ? (
            <div className="mt-1">
              {type === "textarea" ? (
                <Textarea
                  value={editForm[field as keyof Patient] || ""}
                  onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <Input
                  type={type}
                  value={editForm[field as keyof Patient] || ""}
                  onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                  className="mt-1"
                />
              )}
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{currentValue}</p>
          )}
        </div>
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleEditField(field, value || "")}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 sm:mb-4">
        {/* Eliminado el botón de aquí */}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Lista de Pacientes
              </CardTitle>
              <Dialog open={isNewPatientDialogOpen} onOpenChange={(open) => { setIsNewPatientDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="ml-2" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Nuevo Paciente</DialogTitle>
                    <DialogDescription>Registra los datos completos del nuevo paciente</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input id="name" placeholder="Nombre del paciente" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                        <Input id="birthDate" type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" placeholder="+1 234 567 8900" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" placeholder="Dirección completa" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
                      <Input id="emergencyContact" placeholder="+1 234 567 8900" value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Historia médica</Label>
                      <Textarea id="medicalHistory" placeholder="Alergias, medicamentos, condiciones médicas..." rows={3} value={form.medicalHistory} onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreatePatient}>
                      Crear paciente
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="font-medium">{patient.name ?? ""}</div>
                      <div className="text-sm text-muted-foreground">{patient.phone ?? ""}</div>
                      <div className="text-xs text-muted-foreground">
                        {getPatientAppointments(patient.id).length} consultas
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <>
              {(() => {
                const patientConsultations = getPatientAppointments(selectedPatient.id)
                return (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el paciente "{selectedPatient.name}" y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePatient(selectedPatient.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {isMobile ? (
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-base">{tabOptions.find(t => t.value === activeTab)?.label}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-md border bg-muted" aria-label="Abrir menú de pestañas">
                                  <Menu className="h-6 w-6" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {tabOptions.map(tab => (
                                  <DropdownMenuItem key={tab.value} onClick={() => setActiveTab(tab.value)}>
                                    {tab.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <TabsList className="grid w-full grid-cols-3">
                            {tabOptions.map(tab => (
                              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                            ))}
                          </TabsList>
                        )}

                        <TabsContent value="info" className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderEditableField("name", "Nombre", selectedPatient.name ?? "")}
                            {renderEditableField("birthDate", "Fecha de nacimiento", selectedPatient.birthDate ?? "", "date")}
                            {renderEditableField("email", "Email", selectedPatient.email ?? "")}
                            {renderEditableField("phone", "Teléfono", selectedPatient.phone ?? "")}
                            {renderEditableField("address", "Dirección", selectedPatient.address ?? "")}
                            {renderEditableField("emergencyContact", "Contacto de emergencia", selectedPatient.emergencyContact ?? "")}
                          </div>
                          <div>
                            {renderEditableField("medicalHistory", "Historia médica", selectedPatient.medicalHistory ?? "", "textarea")}
                          </div>
                        </TabsContent>

                        <TabsContent value="history">
                          <div className="space-y-4">
                            {patientConsultations.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No hay consultas registradas
                              </p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tratamiento</TableHead>
                                    <TableHead>Costo</TableHead>
                                    <TableHead>Estado</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {patientConsultations.map((consultation) => (
                                    <TableRow key={consultation.id}>
                                      <TableCell>{consultation.date}</TableCell>
                                      <TableCell>{consultation.treatment}</TableCell>
                                      <TableCell>${consultation.cost}</TableCell>
                                      <TableCell>
                                        <Badge variant={getPaymentStatusColor(consultation.paymentStatus)}>
                                          {getPaymentStatusText(consultation.paymentStatus)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="billing">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Total Consultas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{patientConsultations.length}</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Total Facturado</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">
                                    ${patientConsultations.reduce((sum, c) => sum + c.cost, 0)}
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Pendiente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">
                                    $
                                    {patientConsultations
                                      .filter((c) => c.paymentStatus === "pending")
                                      .reduce((sum, c) => sum + c.cost, 0)}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )
              })()}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
