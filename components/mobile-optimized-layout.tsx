"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MobileOptimizedLayout({ children, className }: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Detectar mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Detectar conexão
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className={cn("min-h-screen w-full", isMobile && "touch-manipulation select-none", className)}>
      {!isOnline && <div className="bg-red-500 text-white text-center py-2 text-sm">⚠️ Sem conexão com a internet</div>}

      <div className={cn("h-full", isMobile ? "overflow-x-hidden" : "overflow-auto")}>{children}</div>
    </div>
  )
}
