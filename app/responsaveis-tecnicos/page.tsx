"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Mail, Phone, User } from "lucide-react"
import { responsaveisTecnicosService } from "@/services/responsaveis-tecnicos"
import type { ResponsavelTecnico, CreateResponsavelTecnicoData } from "@/types/obra"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MainLayout } from "@/components/main-layout"

export default function ResponsaveisTecnicosPage() {
  const { toast } = useToast()
  const [responsaveis, setResponsaveis] = useState<ResponsavelTecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingResponsavel, setEditingResponsavel] = useState<ResponsavelTecnico | null>(null)
  const [formData, setFormData] = useState<CreateResponsavelTecnicoData>({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
  })

  useEffect(() => {
    const unsubscribe = responsaveisTecnicosService.onSnapshot((responsaveisData) => {
      setResponsaveis(responsaveisData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingResponsavel) {
        await responsaveisTecnicosService.update(editingResponsavel.id, formData)
        toast({
          title: "Responsável atualizado",
          description: "O responsável técnico foi atualizado com sucesso.",
        })
      } else {
        await responsaveisTecnicosService.create(formData)
        toast({
          title: "Responsável criado",
          description: "O responsável técnico foi criado com sucesso.",
        })
      }
      resetForm()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o responsável técnico.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      especialidade: "",
    })
    setEditingResponsavel(null)
    setShowForm(false)
  }

  const handleEdit = (responsavel: ResponsavelTecnico) => {
    setFormData({
      nome: responsavel.nome,
      email: responsavel.email,
      telefone: responsavel.telefone,
      especialidade: responsavel.especialidade,
    })
    setEditingResponsavel(responsavel)
    setShowForm(true)
  }

  const handleDelete = async (responsavel: ResponsavelTecnico) => {
    try {
      await responsaveisTecnicosService.deactivate(responsavel.id)
      toast({
        title: "Responsável desativado",
        description: "O responsável técnico foi desativado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao desativar o responsável técnico.",
        variant: "destructive",
      })
    }
  }

  const headerActions = (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Responsável
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingResponsavel ? "Editar Responsável Técnico" : "Novo Responsável Técnico"}</DialogTitle>
          <DialogDescription>Preencha os dados do responsável técnico</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="joao@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <Label htmlFor="especialidade">Especialidade</Label>
            <Input
              id="especialidade"
              value={formData.especialidade}
              onChange={(e) => setFormData((prev) => ({ ...prev, especialidade: e.target.value }))}
              placeholder="Ex: Engenheiro Civil, Arquiteto, Mestre de Obras"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">{editingResponsavel ? "Atualizar" : "Criar"}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <MainLayout
        title="Responsáveis Técnicos"
        description="Gerenciamento de responsáveis técnicos"
        headerActions={headerActions}
      >
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      title="Responsáveis Técnicos"
      description="Gerenciamento de responsáveis técnicos"
      headerActions={headerActions}
    >
      <div className="p-6">
        {responsaveis.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum responsável técnico cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece cadastrando responsáveis técnicos para associar às obras.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar primeiro responsável
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {responsaveis.map((responsavel) => (
              <Card key={responsavel.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {responsavel.nome}
                      </CardTitle>
                      <CardDescription>{responsavel.especialidade}</CardDescription>
                    </div>
                    <Badge className="bg-green-600">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{responsavel.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{responsavel.telefone}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleEdit(responsavel)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desativar responsável técnico</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja desativar "{responsavel.nome}"? Ele não aparecerá mais na lista de
                              responsáveis disponíveis para novas obras.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(responsavel)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Desativar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
