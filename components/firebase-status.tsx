"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Wifi, AlertTriangle, CheckCircle } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [obrasCount, setObrasCount] = useState<number>(0)
  const [responsaveisCount, setResponsaveisCount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus("loading")
      setErrorMessage("")

      // Testar conexão fazendo uma consulta simples
      const obrasSnapshot = await getDocs(collection(db, "obras"))
      const responsaveisSnapshot = await getDocs(collection(db, "responsaveis_tecnicos"))

      setObrasCount(obrasSnapshot.size)
      setResponsaveisCount(responsaveisSnapshot.size)
      setStatus("connected")
    } catch (error) {
      console.error("Erro de conexão Firebase:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Wifi className="h-5 w-5 animate-spin" />
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "bg-yellow-100 text-yellow-800"
      case "connected":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "loading":
        return "Conectando..."
      case "connected":
        return "Conectado"
      case "error":
        return "Erro de Conexão"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Firebase
        </CardTitle>
        <CardDescription>Status da conexão com o banco de dados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          </div>
        </div>

        {status === "connected" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Obras cadastradas</span>
              <Badge variant="secondary">{obrasCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Responsáveis técnicos</span>
              <Badge variant="secondary">{responsaveisCount}</Badge>
            </div>
          </>
        )}

        {status === "error" && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <p className="font-medium">Erro de conexão:</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        )}

        <Button onClick={testConnection} variant="outline" size="sm" className="w-full">
          <Wifi className="h-4 w-4 mr-2" />
          Testar Conexão
        </Button>
      </CardContent>
    </Card>
  )
}
