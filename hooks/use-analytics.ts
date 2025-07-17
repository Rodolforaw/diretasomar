"use client"

import { useEffect, useState } from "react"
import { analytics } from "@/lib/firebase"
import { logEvent } from "firebase/analytics"

export function useAnalytics() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (analytics) {
      setIsReady(true)
    }
  }, [])

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (analytics && isReady) {
      logEvent(analytics, eventName, parameters)
    }
  }

  const trackPageView = (pageName: string) => {
    trackEvent("page_view", {
      page_title: pageName,
      page_location: window.location.href,
    })
  }

  const trackObraAction = (action: "create" | "update" | "delete", obraId?: string) => {
    trackEvent("obra_action", {
      action,
      obra_id: obraId,
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackObraAction,
    isReady,
  }
}
