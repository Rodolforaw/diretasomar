"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Edit3, Square, Circle, MousePointer, Save, X, RotateCcw } from "lucide-react"
import type { Obra } from "@/types/obra"
import { obrasService } from "@/services/obras"
import { useToast } from "@/hooks/use-toast"

interface MapaDesenhoProps {
  obra: Obra | null
  isOpen: boolean
  onClose: () => void
}

type DrawingMode = "select" | "polygon" | "rectangle" | "circle" | "marker" | "line"

export function MapaDesenho({ obra, isOpen, onClose }: MapaDesenhoProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const drawingLayerRef = useRef<any>(null)
  const [currentMode, setCurrentMode] = useState<DrawingMode>("select")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawings, setDrawings] = useState<any[]>([])
  const { toast } = useToast()

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
    if (!isOpen || !obra) return

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

        // Adicionar camada de satélite
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            maxZoom: 19,
          },
        ).addTo(map)

        // Criar camada para desenhos
        const drawingLayer = L.layerGroup().addTo(map)
        drawingLayerRef.current = drawingLayer

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

        // Configurar ferramentas de desenho
        setupDrawingTools(L, map, drawingLayer)

      } catch (err) {
        console.error("Erro ao inicializar mapa:", err)
        if (mounted) {
          setError("Erro ao carregar o mapa")
          setIsLoading(false)
        }
      }
    }

    initializeMap()

    // Carregar desenhos salvos
    if (obra && obra.mapeamento && Array.isArray(obra.mapeamento)) {
      setDrawings(obra.mapeamento)
    } else {
      setDrawings([])
    }

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen, obra])

  const setupDrawingTools = (L: any, map: any, drawingLayer: any) => {
    let currentDrawing: any = null
    let isDrawing = false

    // Função para limpar desenhos
    const clearDrawings = () => {
      drawingLayer.clearLayers()
      setDrawings([])
    }

    // Função para salvar desenhos
    const saveDrawings = async () => {
      const layers = drawingLayerRef.current?.getLayers() || []
      const drawingsData = layers.map((layer: any) => {
        if (layer instanceof L.Polygon) {
          return {
            type: "polygon",
            coordinates: layer.getLatLngs()[0].map((latlng: any) => [latlng.lat, latlng.lng]),
            color: layer.options.color,
          }
        } else if (layer instanceof L.Circle) {
          return {
            type: "circle",
            center: [layer.getLatLng().lat, layer.getLatLng().lng],
            radius: layer.getRadius(),
            color: layer.options.color,
          }
        } else if (layer instanceof L.Marker) {
          return {
            type: "marker",
            position: [layer.getLatLng().lat, layer.getLatLng().lng],
            color: layer.options.color,
          }
        } else if (layer instanceof L.Polyline) {
          return {
            type: "line",
            coordinates: layer.getLatLngs().map((latlng: any) => [latlng.lat, latlng.lng]),
            color: layer.options.color,
          }
        }
      }).filter(Boolean)

      console.log("Desenhos salvos:", drawingsData)
      try {
        if (obra) {
          await obrasService.update(obra.id, { mapeamento: drawingsData })
          toast({ title: "Mapeamento salvo!", description: "Os desenhos foram salvos na obra." })
        }
      } catch (error) {
        toast({ title: "Erro ao salvar mapeamento", description: String(error), variant: "destructive" })
      }
    }

    // Configurar eventos do mapa baseado no modo
    const handleMapClick = (e: any) => {
      if (currentMode === "select") return

      const color = getColorForMode(currentMode)
      let newDrawing: any = null

      switch (currentMode) {
        case "marker":
          newDrawing = L.marker(e.latlng, { color }).addTo(drawingLayer)
          break
        case "circle":
          newDrawing = L.circle(e.latlng, { 
            radius: 50, 
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          }).addTo(drawingLayer)
          break
        case "rectangle":
          if (!isDrawing) {
            isDrawing = true
            const startPoint = e.latlng
            newDrawing = L.rectangle([startPoint, startPoint], { 
              color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2
            }).addTo(drawingLayer)
            currentDrawing = newDrawing
            
            const updateRectangle = (e: any) => {
              if (currentDrawing) {
                currentDrawing.setBounds([startPoint, e.latlng])
              }
            }
            
            const finishRectangle = () => {
              isDrawing = false
              currentDrawing = null
              map.off('mousemove', updateRectangle)
              map.off('click', finishRectangle)
            }
            
            map.on('mousemove', updateRectangle)
            map.on('click', finishRectangle)
          }
          break
        case "polygon":
          if (!isDrawing) {
            isDrawing = true
            const points: any[] = [e.latlng]
            newDrawing = L.polygon(points, { 
              color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2
            }).addTo(drawingLayer)
            currentDrawing = newDrawing
            
            const addPoint = (e: any) => {
              points.push(e.latlng)
              currentDrawing.setLatLngs(points)
            }
            
            const finishPolygon = () => {
              isDrawing = false
              currentDrawing = null
              map.off('click', addPoint)
              map.off('dblclick', finishPolygon)
            }
            
            map.on('click', addPoint)
            map.on('dblclick', finishPolygon)
          }
          break
        case "line":
          if (!isDrawing) {
            isDrawing = true
            const points: any[] = [e.latlng]
            newDrawing = L.polyline(points, { 
              color,
              weight: 3
            }).addTo(drawingLayer)
            currentDrawing = newDrawing
            
            const addPoint = (e: any) => {
              points.push(e.latlng)
              currentDrawing.setLatLngs(points)
            }
            
            const finishLine = () => {
              isDrawing = false
              currentDrawing = null
              map.off('click', addPoint)
              map.off('dblclick', finishLine)
            }
            
            map.on('click', addPoint)
            map.on('dblclick', finishLine)
          }
          break
      }

      if (newDrawing && currentMode !== "rectangle" && currentMode !== "polygon" && currentMode !== "line") {
        setDrawings(prev => [...prev, newDrawing])
      }
    }

    map.on('click', handleMapClick)

    // Expor funções globais
    // @ts-ignore
    window.clearDrawings = clearDrawings
    // @ts-ignore
    window.saveDrawings = saveDrawings
  }

  const getColorForMode = (mode: DrawingMode) => {
    const colors = {
      select: "#6B7280",
      polygon: "#3B82F6",
      rectangle: "#10B981",
      circle: "#F59E0B",
      marker: "#EF4444",
      line: "#8B5CF6",
    }
    return colors[mode] || "#6B7280"
  }

  const handleModeChange = (mode: DrawingMode) => {
    setCurrentMode(mode)
  }

  const handleClearDrawings = () => {
    // @ts-ignore
    if (window.clearDrawings) {
      // @ts-ignore
      window.clearDrawings()
    }
  }

  const handleSaveDrawings = () => {
    // @ts-ignore
    if (window.saveDrawings) {
      // @ts-ignore
      window.saveDrawings()
    }
  }

  if (!obra) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapear Obra: {obra.os}
          </DialogTitle>
          <DialogDescription>
            Desenhe sobre a obra para mapear áreas, pontos e elementos importantes
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Barra de ferramentas */}
          <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Ferramentas:</span>
            </div>
            
            <Button
              variant={currentMode === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("select")}
              className="flex items-center gap-1"
            >
              <MousePointer className="h-3 w-3" />
              Selecionar
            </Button>
            
            <Button
              variant={currentMode === "marker" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("marker")}
              className="flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              Marcador
            </Button>
            
            <Button
              variant={currentMode === "polygon" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("polygon")}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Polígono
            </Button>
            
            <Button
              variant={currentMode === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("rectangle")}
              className="flex items-center gap-1"
            >
              <Square className="h-3 w-3" />
              Retângulo
            </Button>
            
            <Button
              variant={currentMode === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("circle")}
              className="flex items-center gap-1"
            >
              <Circle className="h-3 w-3" />
              Círculo
            </Button>
            
            <Button
              variant={currentMode === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange("line")}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Linha
            </Button>
          </div>

          {/* Informações da obra */}
          <div className="flex items-center gap-4 p-4 border-b bg-blue-50">
            <div className="flex-1">
              <h3 className="font-medium">{obra.os}</h3>
              <p className="text-sm text-muted-foreground">{obra.endereco}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{obra.status.replace("_", " ")}</Badge>
              <Badge variant={obra.criticidade === "Prioridade" ? "destructive" : "secondary"}>
                {obra.criticidade}
              </Badge>
            </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 relative">
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
          </div>

          {/* Barra de ações */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Modo atual: <span className="font-medium">{currentMode}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClearDrawings}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Limpar
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveDrawings}>
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
              <Button onClick={onClose}>
                <X className="h-4 w-4 mr-1" />
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 