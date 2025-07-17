"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import type React from "react"

interface MainLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  headerActions?: React.ReactNode
}

export function MainLayout({ title, description, children, headerActions }: MainLayoutProps) {
  return (
    <div className="flex flex-1 flex-col h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-col flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {headerActions}
      </header>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
