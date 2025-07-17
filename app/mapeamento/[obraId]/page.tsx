"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { obrasService } from "@/services/obras"
import { useToast } from "@/hooks/use-toast"
import type { Obra } from "@/types/obra"

export default function MapeamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [obra, setObra] = useState<Obra | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const obraId = params.obraId as string

  // Carregar obra
  useEffect(() => {
    const loadObra = async () => {
      try {
        const obras = await obrasService.getAll()
        const obraEncontrada = obras.find(o => o.id === obraId)
        if (obraEncontrada) {
          setObra(obraEncontrada)
        } else {
          toast({
            title: "Obra não encontrada",
            description: "A obra solicitada não foi encontrada.",
            variant: "destructive"
          })
          router.push("/mapa")
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar obra",
          description: "Não foi possível carregar os dados da obra.",
          variant: "destructive"
        })
        router.push("/mapa")
      }
    }

    if (obraId) {
      loadObra()
    }
  }, [obraId, router, toast])

  // Função para carregar Leaflet dinamicamente
  const loadLeaflet = async () => {
    try {
      // Adicionar CSS do Leaflet apenas uma vez
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)
      }

      // Importar Leaflet
      const L = await import("leaflet")

      // Configurar ícones padrão do Leaflet
      delete (L as any).Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      return L
    } catch (err) {
      console.error("Erro ao carregar Leaflet:", err)
      throw new Error("Falha ao carregar o mapa")
    }
  }

  useEffect(() => {
    if (!obra) return

    let mounted = true

    const initializeMap = async () => {
      try {
        if (!mapRef.current) return

        setIsLoading(true)
        setError(null)

        const L = await loadLeaflet()

        if (!mounted) return

        // Centralizar na obra
        const center: [number, number] = [obra.latitude, obra.longitude]

        // Criar o mapa
        const map = L.map(mapRef.current, {
          center: center,
          zoom: 18,
          zoomControl: true,
          attributionControl: true,
        })

        // Adicionar camada de rua
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map)

        // Adicionar marcador da obra
        const obraMarker = L.marker(center, {
          icon: L.divIcon({
            html: `
              <div style="
                background-color: #dc2626;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background-color: white;
                  border-radius: 50%;
                "></div>
              </div>
            `,
            className: "obra-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(map)

        // Popup da obra
        obraMarker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">OS: ${obra.os}</h3>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">${obra.endereco}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">${obra.descricaoServico}</p>
          </div>
        `)

        mapInstanceRef.current = map
        setIsLoading(false)

      } catch (err) {
        console.error("Erro ao inicializar mapa:", err)
        if (mounted) {
          setError("Erro ao carregar o mapa")
          setIsLoading(false)
        }
      }
    }

    initializeMap()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [obra])

  if (!obra) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando obra...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/mapa")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Mapa
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Mapeamento da Obra</h1>
              <p className="text-sm text-muted-foreground">OS: {obra.os} - {obra.endereco}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={obra.criticidade === "Prioridade" ? "destructive" : "secondary"}>
              {obra.criticidade}
            </Badge>
            <Badge variant="outline">{obra.status.replace("_", " ")}</Badge>
          </div>
        </div>
      </div>

      {/* Mapa em tela cheia */}
      <div className="relative h-[calc(100vh-80px)]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando mapa...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}
        
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Informações da obra flutuante */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-[1000] max-w-sm">
          <h3 className="font-semibold text-sm mb-2">Informações da Obra</h3>
          <div className="space-y-1 text-xs">
            <p><strong>OS:</strong> {obra.os}</p>
            <p><strong>Endereço:</strong> {obra.endereco}</p>
            <p><strong>Progresso:</strong> {obra.progresso}%</p>
            <p><strong>Status:</strong> {obra.status.replace("_", " ")}</p>
            {obra.mapeamento && obra.mapeamento.length > 0 && (
              <p><strong>Elementos mapeados:</strong> {obra.mapeamento.length}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 