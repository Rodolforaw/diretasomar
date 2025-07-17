"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { HardHat, Map, Bell, Shield, Download } from "lucide-react"
import { FirebaseStatus } from "@/components/firebase-status"
import { MainLayout } from "@/components/main-layout"

export default function ConfiguracoesPage() {
  return (
    <MainLayout title="Configurações" description="Configurações do sistema">
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-primary" />
                Sistema
              </CardTitle>
              <CardDescription>Informações sobre o Diretas Somar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Versão</span>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-600">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Última atualização</span>
                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Firebase */}
          <FirebaseStatus />

          {/* Configurações do Mapa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Mapa
              </CardTitle>
              <CardDescription>Configurações de visualização do mapa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Zoom automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajustar zoom automaticamente para mostrar todas as obras
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar legenda</Label>
                  <p className="text-sm text-muted-foreground">Exibir legenda de status no mapa</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
              </CardTitle>
              <CardDescription>Configurações de alertas e notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Obras atrasadas</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre obras com prazo vencido</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas obras</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando uma nova obra for cadastrada</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>Configurações de segurança e acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backup-frequency">Frequência de backup</Label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>Diário</option>
                  <option>Semanal</option>
                  <option>Mensal</option>
                </select>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Fazer backup agora
              </Button>
            </CardContent>
          </Card>

          {/* Sobre */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Diretas Somar</CardTitle>
              <CardDescription>Sistema de controle de obras em campo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                O Diretas Somar é um sistema completo para gerenciamento e monitoramento de obras em campo, oferecendo
                visualização em mapa, controle de progresso e relatórios detalhados.
              </p>
              <Separator />
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Desenvolvido com:</strong>
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Next.js 14</li>
                  <li>Firebase</li>
                  <li>Leaflet Maps</li>
                  <li>Tailwind CSS</li>
                  <li>shadcn/ui</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
