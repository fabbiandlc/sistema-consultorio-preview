"use client"

import { useState } from "react"
import { User, Plus, Search, FileText, Upload, Eye } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClinic } from "@/contexts/clinic-context"

interface Patient {
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

interface Consultation {
  id: number
  date: string
  treatment: string
  cost: number
  notes: string
  paymentStatus: "paid" | "pending" | "partial"
}

interface Document {
  id: number
  name: string
  type: "radiography" | "photo" | "document"
  uploadDate: string
  url: string
}

export default function PatientManager() {
  const { patients, getPatientAppointments } = useClinic()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestión de Pacientes</h3>
          <p className="text-sm text-muted-foreground">Administra expedientes médicos y historial de pacientes</p>
        </div>
        <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" placeholder="Nombre del paciente" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                  <Input id="birthDate" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" placeholder="Dirección completa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
                <Input id="emergencyContact" placeholder="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Historia médica</Label>
                <Textarea id="medicalHistory" placeholder="Alergias, medicamentos, condiciones médicas..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsNewPatientDialogOpen(false)}>
                Crear paciente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Lista de Pacientes
              </CardTitle>
              <CardDescription>Busca y selecciona un paciente</CardDescription>
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
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">{patient.phone}</div>
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

        <div className="md:col-span-2">
          {selectedPatient ? (
            <>
              {(() => {
                const patientConsultations = getPatientAppointments(selectedPatient.id)
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Expediente: {selectedPatient.name}
                      </CardTitle>
                      <CardDescription>Información completa del paciente</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="info">Información</TabsTrigger>
                          <TabsTrigger value="history">Historial</TabsTrigger>
                          <TabsTrigger value="documents">Documentos</TabsTrigger>
                          <TabsTrigger value="billing">Facturación</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Teléfono</Label>
                              <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Fecha de nacimiento</Label>
                              <p className="text-sm text-muted-foreground">{selectedPatient.birthDate}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Contacto de emergencia</Label>
                              <p className="text-sm text-muted-foreground">{selectedPatient.emergencyContact}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Dirección</Label>
                            <p className="text-sm text-muted-foreground">{selectedPatient.address}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Historia médica</Label>
                            <p className="text-sm text-muted-foreground">{selectedPatient.medicalHistory}</p>
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

                        <TabsContent value="documents">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Documentos del paciente</h4>
                              <Button size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Subir archivo
                              </Button>
                            </div>

                            {selectedPatient.documents.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No hay documentos subidos
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {selectedPatient.documents.map((document) => (
                                  <div
                                    key={document.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div>
                                      <div className="font-medium text-sm">{document.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {document.type} - {document.uploadDate}
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="billing">
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
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
                  <h3 className="mt-4 text-lg font-medium">Selecciona un paciente</h3>
                  <p className="text-sm text-muted-foreground">
                    Elige un paciente de la lista para ver su expediente completo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
