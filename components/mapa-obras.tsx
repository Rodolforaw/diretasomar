"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { Obra } from "@/types/obra"

interface MapaObrasProps {
  obras: Obra[]
  onObraSelect?: (obra: Obra) => void
}

export function MapaObras({ obras, onObraSelect }: MapaObrasProps) {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const layersRef = useRef<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLayer, setCurrentLayer] = useState<"street" | "satellite">("street")

  // Função global para mapear obra (será chamada pelo popup)
  useEffect(() => {
    // @ts-ignore
    window.mapearObra = (obraId: string, os: string) => {
      console.log(`Mapeando obra: ${os} (ID: ${obraId})`)
      
      // Navegar para a página de mapeamento
      router.push(`/mapeamento/${obraId}`)
    }

    return () => {
      // @ts-ignore
      delete window.mapearObra
    }
  }, [obras, router])

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

      // Importar apenas o JavaScript do Leaflet
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
    let mounted = true

    const initializeMap = async () => {
      try {
        if (!mapRef.current) return

        setIsLoading(true)
        setError(null)

        const L = await loadLeaflet()

        if (!mounted) return

        // Centro de Maricá, RJ
        const maricaCenter: [number, number] = [-22.9213, -42.8186]

        // Criar o mapa focado em Maricá
        const map = L.map(mapRef.current, {
          center: maricaCenter,
          zoom: 12,
          zoomControl: true,
          attributionControl: true,
        })

        // Definir as camadas de mapa
        const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        })

        const satelliteLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            maxZoom: 19,
          },
        )

        // Adicionar camada inicial (street)
        streetLayer.addTo(map)

        // Armazenar referências das camadas
        layersRef.current = {
          street: streetLayer,
          satellite: satelliteLayer,
        }

        mapInstanceRef.current = map
        setIsLoading(false)

        // Adicionar marcadores das obras
        updateMarkers(L, map)
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
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkersAsync()
    }
  }, [obras])

  const updateMarkersAsync = async () => {
    try {
      const L = await loadLeaflet()
      updateMarkers(L, mapInstanceRef.current)
    } catch (err) {
      console.error("Erro ao atualizar marcadores:", err)
    }
  }

  const updateMarkers = (L: any, map: any) => {
    // Remover marcadores existentes
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker)
    })
    markersRef.current = []

    // Adicionar novos marcadores para cada obra
    const bounds = L.latLngBounds([])
    let validMarkers = 0

    obras.forEach((obra) => {
      // Verificar se a obra tem coordenadas válidas
      if (!obra.latitude || !obra.longitude) {
        console.warn(`Obra ${obra.os} não possui coordenadas válidas`)
        return
      }

      // Verificar se as coordenadas estão dentro da região de Maricá
      const lat = Number.parseFloat(obra.latitude.toString())
      const lng = Number.parseFloat(obra.longitude.toString())

      if (isNaN(lat) || isNaN(lng) || lat < -23.1 || lat > -22.8 || lng < -42.9 || lng > -42.7) {
        console.warn(`Obra ${obra.os} possui coordenadas fora da região de Maricá:`, lat, lng)
        return
      }

      // Criar ícone customizado baseado no status da obra
      const statusColors = {
        planejada: "#6B7280", // gray
        em_andamento: "#3B82F6", // blue
        concluida: "#10B981", // green
        pausada: "#F59E0B", // yellow
      }

      const color = statusColors[obra.status as keyof typeof statusColors] || "#6B7280"

      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
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
        className: "custom-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

      // Popup com informações da obra
      const popupContent = `
        <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">OS: ${obra.os}</h3>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">${obra.endereco}</p>
          <div style="margin: 6px 0;">
            <span style="
              background-color: ${color};
              color: white;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              text-transform: uppercase;
              margin-right: 6px;
            ">
              ${getStatusLabel(obra.status)}
            </span>
            <span style="
              background-color: ${obra.criticidade === "Prioridade" ? "#dc2626" : "#6b7280"};
              color: white;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
            ">
              ${obra.criticidade}
            </span>
          </div>
          <div style="margin: 8px 0; font-size: 13px;">
            <div style="margin: 2px 0;"><strong>Distrito:</strong> ${obra.distrito}</div>
            <div style="margin: 2px 0;"><strong>Progresso:</strong> ${obra.progresso}%</div>
            <div style="margin: 2px 0;"><strong>Responsável:</strong> ${obra.responsavelTecnico?.nome || "Não informado"}</div>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <button 
              onclick="window.mapearObra('${obra.id}', '${obra.os}')"
              style="
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                width: 100%;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              🗺️ Mapear Obra
            </button>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      // Evento de clique no marcador
      if (onObraSelect) {
        marker.on("click", () => onObraSelect(obra))
      }

      markersRef.current.push(marker)
      bounds.extend([lat, lng])
      validMarkers++
    })

    // Ajustar zoom para mostrar todos os marcadores válidos
    if (validMarkers > 0) {
      if (validMarkers === 1) {
        // Se há apenas uma obra, centralizar nela com zoom fixo
        map.setView(bounds.getCenter(), 15)
      } else {
        // Se há múltiplas obras, ajustar para mostrar todas
        map.fitBounds(bounds.pad(0.1), { maxZoom: 15 })
      }
    } else {
      // Se não há obras válidas, centralizar em Maricá
      map.setView([-22.9213, -42.8186], 12)
    }
  }

  const toggleLayer = () => {
    if (!mapInstanceRef.current || !layersRef.current) return

    const map = mapInstanceRef.current
    const { street, satellite } = layersRef.current

    if (currentLayer === "street") {
      map.removeLayer(street)
      map.addLayer(satellite)
      setCurrentLayer("satellite")
    } else {
      map.removeLayer(satellite)
      map.addLayer(street)
      setCurrentLayer("street")
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      planejada: "Planejada",
      em_andamento: "Em Andamento",
      concluida: "Concluída",
      pausada: "Pausada",
    }
    return labels[status as keyof typeof labels] || status
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa das Obras - Maricá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa das Obras - Maricá ({obras.length})
            </div>
            <Button onClick={toggleLayer} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <Layers className="h-4 w-4" />
              {currentLayer === "street" ? "Satélite" : "Mapa"}
            </Button>
          </CardTitle>
          <CardDescription>
            Visualização geográfica das obras em Maricá, RJ -{" "}
            {currentLayer === "street" ? "Vista de Rua" : "Vista de Satélite"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legenda */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-sm"></div>
                <span>Planejada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                <span>Em Andamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                <span>Pausada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                <span>Concluída</span>
              </div>
            </div>

            {/* Mapa */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Carregando mapa de Maricá...</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="h-[500px] rounded-lg border" style={{ minHeight: "500px" }} />

              {/* Indicador do modo atual */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm z-[1000]">
                {currentLayer === "street" ? "🗺️ Mapa" : "🛰️ Satélite"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </>
  )
}
