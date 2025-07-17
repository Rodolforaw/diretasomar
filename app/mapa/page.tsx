"use client"

import { useEffect, useState } from "react"
import { MapaObras } from "@/components/mapa-obras"
import { obrasService } from "@/services/obras"
import type { Obra } from "@/types/obra"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MainLayout } from "@/components/main-layout"
import { formatDateSafe } from "@/lib/date-utils"

export default function MapaPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = obrasService.onSnapshot((obrasData) => {
      setObras(obrasData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleObraClick = (obra: Obra) => {
    setSelectedObra(obra)
  }

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

  if (loading) {
    return (
      <MainLayout title="Mapa Operacional" description="Visualização geográfica das obras">
        <div className="p-4 h-full">
          <div className="h-full animate-pulse bg-gray-200 rounded-lg"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Mapa Operacional" description="Visualização geográfica das obras">
      <div className="flex h-full">
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <MapaObras obras={obras} onObraClick={handleObraClick} />
            </CardContent>
          </Card>
        </div>

        {selectedObra && (
          <div className="w-80 p-4 border-l bg-background">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  OS: {selectedObra.os}
                  <Badge className={getStatusColor(selectedObra.status)}>{getStatusLabel(selectedObra.status)}</Badge>
                </CardTitle>
                <CardDescription>{selectedObra.endereco}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <p className="text-sm text-muted-foreground">{selectedObra.tipo}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição do Serviço</label>
                  <p className="text-sm text-muted-foreground">{selectedObra.descricaoServico}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Progresso</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedObra.progresso} className="flex-1" />
                    <span className="text-sm font-medium">{selectedObra.progresso}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Responsável Técnico</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedObra.responsavelTecnico?.nome || "Não informado"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Distrito</label>
                  <p className="text-sm text-muted-foreground">{selectedObra.distrito}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Coordenadas</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedObra.latitude.toFixed(6)}, {selectedObra.longitude.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Início Previsto</label>
                    <p className="text-sm text-muted-foreground">{formatDateSafe(selectedObra.inicioPrevisto)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conclusão Prevista</label>
                    <p className="text-sm text-muted-foreground">{formatDateSafe(selectedObra.conclusaoPrevista)}</p>
                  </div>
                </div>

                {selectedObra.materiais && selectedObra.materiais.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Materiais ({selectedObra.materiais.length})</label>
                    <p className="text-sm text-muted-foreground">
                      Valor total:{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(selectedObra.materiais.reduce((acc, mat) => acc + mat.valorTotal, 0))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
