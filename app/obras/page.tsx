"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/main-layout"
import { ObraForm } from "@/components/obra-form"
import { ObraDetailsModal } from "@/components/obra-details-modal"
import { obrasService } from "@/services/obras"
import { responsaveisTecnicosService } from "@/services/responsaveis-tecnicos"
import { exportObrasToExcel, exportSingleObraToExcel } from "@/lib/excel-utils"
import { formatDateSafe, formatCurrency } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"
import type { Obra } from "@/types/obra"
import type { ResponsavelTecnico } from "@/types/obra"
import { Plus, Search, Download, MoreHorizontal, Eye, Edit, Trash2, Play, Pause, Square, X, Filter } from "lucide-react"

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [responsaveis, setResponsaveis] = useState<ResponsavelTecnico[]>([])
  const [filteredObras, setFilteredObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [criticidadeFilter, setCriticidadeFilter] = useState<string>("all")

  // Estados para o popup de ação
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<"start" | "pause" | "complete" | null>(null)
  const [actionObra, setActionObra] = useState<Obra | null>(null)
  const [motivo, setMotivo] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterObras()
  }, [obras, searchTerm, statusFilter, criticidadeFilter])

  const loadData = async () => {
    try {
      setLoading(true)

      // Usar onSnapshot para dados em tempo real
      const unsubscribeObras = obrasService.onSnapshot((obrasData) => {
        setObras(obrasData)
      })

      const unsubscribeResponsaveis = responsaveisTecnicosService.onSnapshot((responsaveisData) => {
        setResponsaveis(responsaveisData)
      })

      setLoading(false)

      // Cleanup function será chamada quando o componente desmontar
      return () => {
        unsubscribeObras()
        unsubscribeResponsaveis()
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const filterObras = () => {
    let filtered = obras

    if (searchTerm) {
      filtered = filtered.filter(
        (obra) =>
          obra.os?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          obra.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          obra.distrito?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          obra.descricaoServico?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((obra) => obra.status === statusFilter)
    }

    if (criticidadeFilter !== "all") {
      filtered = filtered.filter((obra) => obra.criticidade === criticidadeFilter)
    }

    setFilteredObras(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      planejada: "bg-gray-500",
      em_andamento: "bg-blue-500",
      concluida: "bg-green-500",
      pausada: "bg-yellow-500",
    }
    return colors[status as keyof typeof colors] || "bg-gray-500"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      planejada: "Planejada",
      em_andamento: "Em Andamento",
      concluida: "Concluída",
      pausada: "Pausada",
    }
    return labels[status as keyof typeof labels] || status
  }

  const getCriticidadeColor = (criticidade: string) => {
    const colors = {
      Normal: "bg-green-100 text-green-800",
      Prioridade: "bg-red-100 text-red-800",
      baixa: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
    }
    return colors[criticidade as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCriticidadeLabel = (criticidade: string) => {
    const labels = {
      Normal: "Normal",
      Prioridade: "Prioridade",
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
    }
    return labels[criticidade as keyof typeof labels] || criticidade
  }

  const getResponsavelNome = (responsavelId: string) => {
    const responsavel = responsaveis.find((r) => r.id === responsavelId)
    return responsavel?.nome || "Não informado"
  }

  const handleAction = (obra: Obra, type: "start" | "pause" | "complete") => {
    setActionObra(obra)
    setActionType(type)
    setMotivo("")
    setShowActionDialog(true)
  }

  const confirmAction = async () => {
    if (!actionType || !actionObra) return

    setActionLoading(true)
    try {
      let newStatus: Obra["status"]
      let newProgresso = actionObra.progresso

      switch (actionType) {
        case "start":
          newStatus = "em_andamento"
          break
        case "pause":
          newStatus = "pausada"
          break
        case "complete":
          newStatus = "concluida"
          newProgresso = 100
          break
        default:
          return
      }

      await obrasService.update(actionObra.id, {
        status: newStatus,
        progresso: newProgresso,
        observacao: actionObra.observacao
          ? `${actionObra.observacao}\n\n[${new Date().toLocaleString("pt-BR")}] ${getActionLabel(actionType)}: ${motivo}`
          : `[${new Date().toLocaleString("pt-BR")}] ${getActionLabel(actionType)}: ${motivo}`,
      })

      toast({
        title: "Status atualizado",
        description: `Obra ${getActionLabel(actionType).toLowerCase()} com sucesso.`,
      })

      setShowActionDialog(false)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da obra.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getActionLabel = (type: "start" | "pause" | "complete") => {
    const labels = {
      start: "Iniciada",
      pause: "Pausada",
      complete: "Concluída",
    }
    return labels[type]
  }

  const getDialogTitle = () => {
    const titles = {
      start: "Iniciar Obra",
      pause: "Pausar Obra",
      complete: "Concluir Obra",
    }
    return actionType ? titles[actionType] : ""
  }

  const getDialogDescription = () => {
    const descriptions = {
      start: "Informe o motivo do início da obra",
      pause: "Informe o motivo da pausa da obra",
      complete: "Informe os detalhes da conclusão da obra",
    }
    return actionType ? descriptions[actionType] : ""
  }

  const canStart = (obra: Obra) => obra.status === "planejada" || obra.status === "pausada"
  const canPause = (obra: Obra) => obra.status === "em_andamento"
  const canComplete = (obra: Obra) => obra.status === "em_andamento"

  const handleEdit = (obra: Obra) => {
    setSelectedObra(obra)
    setShowForm(true)
  }

  const handleView = (obra: Obra) => {
    setSelectedObra(obra)
    setShowDetails(true)
  }

  const handleDelete = async (obra: Obra) => {
    if (confirm(`Tem certeza que deseja excluir a obra "${obra.os}"?`)) {
      try {
        await obrasService.delete(obra.id)
        toast({
          title: "Obra excluída",
          description: "Obra excluída com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao excluir obra:", error)
        toast({
          title: "Erro",
          description: "Erro ao excluir obra.",
          variant: "destructive",
        })
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCriticidadeFilter("all")
  }

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => exportObrasToExcel(filteredObras, responsaveis)}>
        <Download className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Obra
      </Button>
    </div>
  )

  if (loading) {
    return (
      <MainLayout title="Obras" description="Gerenciamento de obras" headerActions={headerActions}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando obras...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Obras" description="Gerenciamento de obras" headerActions={headerActions}>
      <div className="space-y-6 p-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              {filteredObras.length} de {obras.length} obras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por O.S, endereço, bairro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>

              <Select value={criticidadeFilter} onValueChange={setCriticidadeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Prioridade">Prioridade</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">O.S</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Criticidade</TableHead>
                    <TableHead className="min-w-[200px]">Endereço</TableHead>
                    <TableHead className="min-w-[120px]">Distrito</TableHead>
                    <TableHead className="min-w-[140px]">Progresso</TableHead>
                    <TableHead className="min-w-[180px]">Responsável</TableHead>
                    <TableHead className="min-w-[120px]">Valor</TableHead>
                    <TableHead className="min-w-[100px]">Início</TableHead>
                    <TableHead className="min-w-[100px]">Previsão</TableHead>
                    <TableHead className="min-w-[200px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObras.map((obra) => (
                    <TableRow key={obra.id}>
                      <TableCell className="font-medium">{obra.os}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(obra.status)} text-white`}>
                          {getStatusLabel(obra.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getCriticidadeColor(obra.criticidade)}>
                          {getCriticidadeLabel(obra.criticidade)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={obra.endereco}>
                          {obra.endereco}
                        </div>
                      </TableCell>
                      <TableCell>{obra.distrito}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={obra.progresso} className="w-20" />
                          <span className="text-sm text-muted-foreground min-w-[35px]">{obra.progresso}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate" title={obra.responsavelTecnico?.nome || "Não informado"}>
                          {obra.responsavelTecnico?.nome || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(obra.valor_total || 0)}</TableCell>
                      <TableCell className="text-sm">{formatDateSafe(obra.inicioPrevisto)}</TableCell>
                      <TableCell className="text-sm">{formatDateSafe(obra.conclusaoPrevista)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {/* Controles de Status */}
                          {canStart(obra) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(obra, "start")}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 -ml-1 text-green-600 hover:text-green-700"
                              title="Iniciar obra"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}

                          {canPause(obra) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(obra, "pause")}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 -ml-1 text-yellow-600 hover:text-yellow-700"
                              title="Pausar obra"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}

                          {canComplete(obra) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(obra, "complete")}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 -ml-1 text-blue-600 hover:text-blue-700"
                              title="Concluir obra"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Menu de Ações */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 -ml-1"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(obra)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(obra)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => exportSingleObraToExcel(obra)}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar Excel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(obra)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredObras.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {obras.length === 0 ? "Nenhuma obra cadastrada" : "Nenhuma obra encontrada com os filtros aplicados"}
                </p>
                {obras.length === 0 && (
                  <Button onClick={() => setShowForm(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira obra
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para Ações de Status */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getDialogTitle()}</DialogTitle>
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="motivo">Motivo/Observação *</Label>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={`Descreva o motivo da ${actionType === "start" ? "início" : actionType === "pause" ? "pausa" : "conclusão"} da obra...`}
                  rows={3}
                  required
                />
              </div>

              {actionType === "complete" && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">✅ A obra será marcada como concluída com 100% de progresso.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={confirmAction} disabled={actionLoading || !motivo.trim()} className="flex-1">
                {actionLoading ? "Processando..." : `Confirmar ${getActionLabel(actionType || "start")}`}
              </Button>
              <Button variant="outline" onClick={() => setShowActionDialog(false)} disabled={actionLoading}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modais */}
        {showForm && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedObra ? "Editar Obra" : "Nova Obra"}</DialogTitle>
                <DialogDescription>
                  {selectedObra ? "Atualize as informações da obra" : "Preencha os dados para cadastrar uma nova obra"}
                </DialogDescription>
              </DialogHeader>
              <ObraForm
                obra={selectedObra}
                onSuccess={() => {
                  setShowForm(false)
                  setSelectedObra(null)
                }}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedObra(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {showDetails && selectedObra && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes da Obra</DialogTitle>
                <DialogDescription>Informações completas da obra {selectedObra?.os}</DialogDescription>
              </DialogHeader>
              <ObraDetailsModal obra={selectedObra} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}
