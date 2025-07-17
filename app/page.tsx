"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Clock, CheckCircle, AlertTriangle, DollarSign } from "lucide-react"
import { obrasService } from "@/services/obras"
import type { Obra } from "@/types/obra"
import { Progress } from "@/components/ui/progress"
import { MainLayout } from "@/components/main-layout"
import { ConnectionStatus } from "@/components/connection-status"
import { useFirebase } from "@/components/firebase-provider"

export default function Dashboard() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const { isConnected } = useFirebase()

  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = obrasService.onSnapshot((obrasData) => {
      setObras(obrasData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isConnected])

  const stats = {
    total: obras.length,
    emAndamento: obras.filter((obra) => obra.status === "em_andamento").length,
    concluidas: obras.filter((obra) => obra.status === "concluida").length,
    atrasadas: obras.filter((obra) => {
      if (obra.status === "concluida" || !obra.conclusaoPrevista) return false
      return new Date(obra.conclusaoPrevista) < new Date()
    }).length,
    valorTotalMateriais: obras.reduce((acc, obra) => {
      return acc + (obra.materiais?.reduce((matAcc, material) => matAcc + material.valorTotal, 0) || 0)
    }, 0),
  }

  return (
    <MainLayout title="Dashboard" description="Visão geral das obras">
      <div className="p-6 space-y-6">
        <ConnectionStatus />

        {!isConnected ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aguardando Conexão</h3>
              <p className="text-muted-foreground text-center">Conectando ao Firebase...</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Obras</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.emAndamento}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.concluidas}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.atrasadas}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Valor Total em Materiais</CardTitle>
                  <CardDescription>Valor total dos materiais cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(stats.valorTotalMateriais)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Obras Recentes</CardTitle>
                  <CardDescription>Últimas obras cadastradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {obras.slice(0, 3).map((obra) => (
                      <div key={obra.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">OS: {obra.os}</p>
                          <p className="text-sm text-muted-foreground">{obra.descricaoServico}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Progress value={obra.progresso} className="w-16" />
                            <span className="text-sm">{obra.progresso}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{obra.status.replace("_", " ")}</p>
                        </div>
                      </div>
                    ))}
                    {obras.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma obra cadastrada ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
