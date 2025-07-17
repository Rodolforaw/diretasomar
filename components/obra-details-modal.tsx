"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, User, Calendar, Package, FileText } from "lucide-react"
import type { Obra } from "@/types/obra"
import { formatDateSafe } from "@/lib/date-utils"

interface ObraDetailsModalProps {
  obra: Obra
}

export function ObraDetailsModal({ obra }: ObraDetailsModalProps) {
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

  const valorTotalMateriais = obra.materiais?.reduce((acc, material) => acc + material.valorTotal, 0) || 0

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">OS: {obra.os}</h2>
          <p className="text-muted-foreground">{obra.tipo}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge className={getStatusColor(obra.status)}>{getStatusLabel(obra.status)}</Badge>
          <Badge variant={obra.criticidade === "Prioridade" ? "destructive" : "secondary"}>{obra.criticidade}</Badge>
        </div>
      </div>

      {/* Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso da Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso atual</span>
              <span className="font-medium">{obra.progresso}%</span>
            </div>
            <Progress value={obra.progresso} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Descrição do Serviço</label>
            <p className="text-sm mt-1">{obra.descricaoServico}</p>
          </div>

          {obra.observacao && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Observações</label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{obra.observacao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bairro</label>
              <p className="text-sm mt-1">{obra.distrito}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Coordenadas</label>
              <p className="text-sm mt-1 font-mono">
                {obra.latitude.toFixed(6)}, {obra.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Endereço Completo</label>
            <p className="text-sm mt-1">{obra.endereco}</p>
          </div>

          {obra.localDivergente && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Local Divergente</label>
              <p className="text-sm mt-1">{obra.localDivergente}</p>
            </div>
          )}

          {obra.localReferencia && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Local de Referência</label>
              <p className="text-sm mt-1">{obra.localReferencia}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responsável Técnico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Responsável Técnico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {obra.responsavelTecnico ? (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-sm mt-1">{obra.responsavelTecnico.nome}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm mt-1">{obra.responsavelTecnico.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm mt-1">{obra.responsavelTecnico.telefone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Especialidade</label>
                <p className="text-sm mt-1">{obra.responsavelTecnico.especialidade}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum responsável técnico atribuído</p>
          )}
        </CardContent>
      </Card>

      {/* Cronograma */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Início Previsto</label>
              <p className="text-sm mt-1">{formatDateSafe(obra.inicioPrevisto)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Conclusão Prevista</label>
              <p className="text-sm mt-1">{formatDateSafe(obra.conclusaoPrevista)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materiais */}
      {obra.materiais && obra.materiais.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materiais ({obra.materiais.length})
            </CardTitle>
            <CardDescription>
              Valor total:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valorTotalMateriais)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {obra.materiais.map((material, index) => (
                <div key={material.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{material.nome}</h4>
                    <Badge variant="outline">{material.unidade}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Quantidade: {material.quantidade} {material.unidade} ×{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(material.valorUnitario)}{" "}
                      ={" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(material.valorTotal)}
                    </p>
                    {material.fornecedor && <p>Fornecedor: {material.fornecedor}</p>}
                    {material.observacoes && <p>Obs: {material.observacoes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">Criado em</label>
              <p className="mt-1">{formatDateSafe(obra.createdAt)}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Última atualização</label>
              <p className="mt-1">{formatDateSafe(obra.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
