"use client"

import { BarChart3, HardHat, Map, Building2, Settings, Users, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      } else {
        setIsExpanded(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative z-50 flex h-screen flex-col bg-[#970700] text-white transition-all duration-300",
        isExpanded ? "w-64" : "w-16",
        isMobile && !isExpanded ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-red-800 px-4 py-4",
          isExpanded ? "gap-3" : "justify-center"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white flex-shrink-0">
            <HardHat className="h-6 w-6 text-[#970700]" />
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">Diretas Somar</h1>
              <p className="text-sm text-red-100 truncate">Controle de Obras</p>
            </div>
          )}
        </div>

        {/* Botão de toggle para mobile */}
        {isMobile && (
          <div className="border-b border-red-800 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full h-8 text-white hover:bg-red-800"
            >
              {isExpanded ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Menu */}
        <div className="flex-1 px-3 py-4">
          {isExpanded && (
            <div className="mb-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-red-200">Menu Principal</p>
            </div>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                    isActive ? "bg-white text-[#970700]" : "text-red-100 hover:bg-red-800 hover:text-white",
                    !isExpanded && "justify-center"
                  )}
                  title={!isExpanded ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {isExpanded && <span className="truncate">{item.title}</span>}
                  
                  {/* Tooltip para modo colapsado */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className={cn(
          "border-t border-red-800 p-4",
          !isExpanded && "text-center"
        )}>
          {isExpanded ? (
            <p className="text-xs text-red-200">© 2024 Diretas Somar</p>
          ) : (
            <p className="text-xs text-red-200">© 2024</p>
          )}
        </div>
      </div>

      {/* Botão flutuante para abrir sidebar em mobile */}
      {isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#970700] text-white rounded-lg shadow-lg lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  )
}
