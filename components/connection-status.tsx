"use client"

import { useFirebase } from "@/components/firebase-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected, error } = useFirebase()

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error} - Verifique sua conexão com a internet</AlertDescription>
      </Alert>
    )
  }

  if (!isConnected) {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Conectando ao Firebase...</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">Conectado ao Firebase com sucesso</AlertDescription>
    </Alert>
  )
}
