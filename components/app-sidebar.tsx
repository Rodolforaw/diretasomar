"use client"

import { BarChart3, HardHat, Map, Building2, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Mapa Operacional",
    url: "/mapa",
    icon: Map,
  },
  {
    title: "Obras",
    url: "/obras",
    icon: Building2,
  },
  {
    title: "Responsáveis Técnicos",
    url: "/responsaveis-tecnicos",
    icon: Users,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-[#970700] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-red-800 px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <HardHat className="h-6 w-6 text-[#970700]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Diretas Somar</h1>
          <p className="text-sm text-red-100">Controle de Obras</p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 py-4">
        <div className="mb-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-red-200">Menu Principal</p>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-white text-[#970700]" : "text-red-100 hover:bg-red-800 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-red-800 p-4">
        <p className="text-xs text-red-200">© 2024 Diretas Somar</p>
      </div>
    </div>
  )
}
