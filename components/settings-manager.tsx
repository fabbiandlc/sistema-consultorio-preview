"use client"

import { useState } from "react"
import { Clipboard, Plus, Edit, Trash2, DollarSign, Clock } from "lucide-react"
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
import { useClinic, type Treatment } from "@/contexts/clinic-context"

export default function SettingsManager() {
  const { treatments, addTreatment, updateTreatment, deleteTreatment } = useClinic()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    defaultCost: "",
    description: "",
    duration: "",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.defaultCost) return

    const treatmentData = {
      name: formData.name,
      defaultCost: Number.parseFloat(formData.defaultCost),
      description: formData.description,
      duration: formData.duration,
    }

    if (editingTreatment) {
      updateTreatment(editingTreatment.id, treatmentData)
    } else {
      addTreatment(treatmentData)
    }

    setFormData({ name: "", defaultCost: "", description: "", duration: "" })
    setEditingTreatment(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment)
    setFormData({
      name: treatment.name,
      defaultCost: treatment.defaultCost.toString(),
      description: treatment.description || "",
      duration: treatment.duration || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    deleteTreatment(id)
  }

  const resetForm = () => {
    setFormData({ name: "", defaultCost: "", description: "", duration: "" })
    setEditingTreatment(null)
  }

  return (
    <div className="space-y-6">
      {/* Gestión de Tratamientos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Gestión de Tratamientos
              </CardTitle>
              <CardDescription>Administra los tipos de tratamientos disponibles</CardDescription>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Tratamiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTreatment ? "Editar Tratamiento" : "Nuevo Tratamiento"}</DialogTitle>
                  <DialogDescription>
                    {editingTreatment
                      ? "Modifica los datos del tratamiento"
                      : "Agrega un nuevo tipo de tratamiento al sistema"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del tratamiento"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="defaultCost" className="text-right">
                      Costo
                    </Label>
                    <Input
                      id="defaultCost"
                      type="number"
                      value={formData.defaultCost}
                      onChange={(e) => setFormData({ ...formData, defaultCost: e.target.value })}
                      placeholder="0"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duración
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="ej: 45 min"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción del tratamiento"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSubmit}>
                    {editingTreatment ? "Guardar cambios" : "Crear tratamiento"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Costo por Defecto</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className="font-medium">{treatment.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {treatment.defaultCost}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {treatment.duration || "No especificada"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{treatment.description || "Sin descripción"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(treatment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar tratamiento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el tratamiento "
                              {treatment.name}" del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(treatment.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Estadísticas de Tratamientos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tratamientos</CardTitle>
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments.length}</div>
            <p className="text-xs text-muted-foreground">Tipos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(treatments.reduce((sum, t) => sum + t.defaultCost, 0) / treatments.length)}
            </div>
            <p className="text-xs text-muted-foreground">Por tratamiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Más Económico</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.min(...treatments.map((t) => t.defaultCost))}</div>
            <p className="text-xs text-muted-foreground">
              {treatments.find((t) => t.defaultCost === Math.min(...treatments.map((t) => t.defaultCost)))?.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Más Costoso</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.max(...treatments.map((t) => t.defaultCost))}</div>
            <p className="text-xs text-muted-foreground">
              {treatments.find((t) => t.defaultCost === Math.max(...treatments.map((t) => t.defaultCost)))?.name}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
