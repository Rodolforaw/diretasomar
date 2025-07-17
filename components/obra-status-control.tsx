"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Eye, Download } from "lucide-react"
import type { Obra } from "@/types/obra"
import { obrasService } from "@/services/obras"
import { useToast } from "@/hooks/use-toast"
import { exportSingleObraToExcel } from "@/lib/excel-utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface ObraStatusControlProps {
  obra: Obra
  onStatusChange?: () => void
  onView?: (obra: Obra) => void
}

export function ObraStatusControl({ obra, onStatusChange, onView }: ObraStatusControlProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [actionType, setActionType] = useState<"start" | "pause" | "complete" | null>(null)
  const [motivo, setMotivo] = useState("")
  const [progresso, setProgresso] = useState(obra.progresso)

  const getStatusColor = (status: string) => {
    const colors = {
      planejada: "bg-gray-500",
      em_andamento: "bg-primary",
      concluida: "bg-green-600",
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

  const handleAction = (type: "start" | "pause" | "complete") => {
    setActionType(type)
    setMotivo("")

    // Para conclusão, definir progresso como 100%
    if (type === "complete") {
      setProgresso(100)
    }

    setShowDialog(true)
  }

  const confirmAction = async () => {
    if (!actionType) return

    setLoading(true)
    try {
      let newStatus: Obra["status"]
      let newProgresso = progresso

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

      await obrasService.update(obra.id, {
        status: newStatus,
        progresso: newProgresso,
        observacao: obra.observacao
          ? `${obra.observacao}\n\n[${new Date().toLocaleString("pt-BR")}] ${getActionLabel(actionType)}: ${motivo}`
          : `[${new Date().toLocaleString("pt-BR")}] ${getActionLabel(actionType)}: ${motivo}`,
      })

      toast({
        title: "Status atualizado",
        description: `Obra ${getActionLabel(actionType).toLowerCase()} com sucesso.`,
      })

      setShowDialog(false)
      onStatusChange?.()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da obra.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const canStart = obra.status === "planejada" || obra.status === "pausada"
  const canPause = obra.status === "em_andamento"
  const canComplete = obra.status === "em_andamento"

  return (
    <div className="flex items-center gap-1">
      {/* Status Badge */}
      <Badge className={getStatusColor(obra.status)} variant="secondary">
        {getStatusLabel(obra.status)}
      </Badge>

      {/* Ações */}
      <div className="flex gap-1 ml-2">
        {/* Visualizar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView?.(obra)}
          className="h-8 w-8 p-0"
          title="Visualizar obra"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {/* Download Excel */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => exportSingleObraToExcel(obra)}
          className="h-8 w-8 p-0"
          title="Baixar Excel"
        >
          <Download className="h-4 w-4" />
        </Button>

        {/* Iniciar */}
        {canStart && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("start")}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
            title="Iniciar obra"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        {/* Pausar */}
        {canPause && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("pause")}
            className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
            title="Pausar obra"
          >
            <Pause className="h-4 w-4" />
          </Button>
        )}

        {/* Concluir */}
        {canComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("complete")}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
            title="Concluir obra"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dialog para confirmação */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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

            {actionType === "start" && obra.status !== "pausada" && (
              <div>
                <Label htmlFor="progresso">Progresso Inicial (%)</Label>
                <Input
                  id="progresso"
                  type="number"
                  min="0"
                  max="100"
                  value={progresso}
                  onChange={(e) => setProgresso(Number(e.target.value))}
                />
              </div>
            )}

            {actionType === "complete" && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">✅ A obra será marcada como concluída com 100% de progresso.</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={confirmAction} disabled={loading || !motivo.trim()} className="flex-1">
              {loading ? "Processando..." : `Confirmar ${getActionLabel(actionType || "start")}`}
            </Button>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
