"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface FirebaseContextType {
  isConnected: boolean
  error: string | null
}

const FirebaseContext = createContext<FirebaseContextType>({
  isConnected: false,
  error: null,
})

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Testa a conexão fazendo uma consulta simples
        await getDoc(doc(db, "test", "connection"))
        setIsConnected(true)
        setError(null)
      } catch (err) {
        console.error("Erro de conexão Firebase:", err)
        setError("Erro ao conectar com o Firebase")
        setIsConnected(false)
      }
    }

    testConnection()
  }, [])

  return <FirebaseContext.Provider value={{ isConnected, error }}>{children}</FirebaseContext.Provider>
}

export const useFirebase = () => useContext(FirebaseContext)
