"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, BarChart3, Shield, Cloud } from "lucide-react"
import { db, auth, storage, analytics } from "@/lib/firebase"

export function FirebaseStatus() {
  const [status, setStatus] = useState({
    firestore: false,
    auth: false,
    storage: false,
    analytics: false,
  })

  useEffect(() => {
    // Verificar status dos serviços Firebase
    const checkServices = () => {
      setStatus({
        firestore: !!db,
        auth: !!auth,
        storage: !!storage,
        analytics: !!analytics,
      })
    }

    checkServices()
  }, [])

  const services = [
    {
      name: "Firestore Database",
      icon: Database,
      status: status.firestore,
      description: "Banco de dados das obras",
    },
    {
      name: "Authentication",
      icon: Shield,
      status: status.auth,
      description: "Sistema de autenticação",
    },
    {
      name: "Storage",
      icon: Cloud,
      status: status.storage,
      description: "Armazenamento de arquivos",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      status: status.analytics,
      description: "Análise de uso",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Status dos Serviços Firebase
        </CardTitle>
        <CardDescription>Status de conexão com os serviços do Firebase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <service.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <Badge className={service.status ? "bg-green-600" : "bg-red-600"}>
                {service.status ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Project ID:</span>
            <span className="font-mono">diretasomar</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
