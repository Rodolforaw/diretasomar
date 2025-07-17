"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Edit3, Square, Circle, MousePointer, Save, X, RotateCcw, ArrowLeft, Layers, Trash2 } from "lucide-react"
import { obrasService } from "@/services/obras"
import { useToast } from "@/hooks/use-toast"
import type { Obra } from "@/types/obra"

type DrawingMode = "select" | "polygon" | "rectangle" | "circle" | "marker" | "line"

interface DrawingElement {
  id: string
  type: DrawingMode
  coordinates: any
  color: string
  produto?: string
  observacao?: string
}

export default function MapeamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const drawingLayerRef = useRef<any>(null)
  const [obra, setObra] = useState<Obra | null>(null)
  const [currentMode, setCurrentMode] = useState<DrawingMode>("select")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawings, setDrawings] = useState<DrawingElement[]>([])
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingElement | null>(null)
  const [produto, setProduto] = useState("")
  const [observacao, setObservacao] = useState("")

  const obraId = params.obraId as string

  // Carregar obra
  useEffect(() => {
    const loadObra = async () => {
      try {
        const obras = await obrasService.getAll()
        const obraEncontrada = obras.find(o => o.id === obraId)
        if (obraEncontrada) {
          setObra(obraEncontrada)
          if (obraEncontrada.mapeamento) {
            setDrawings(obraEncontrada.mapeamento)
          }
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

        // Carregar desenhos existentes
        loadExistingDrawings(L, drawingLayer)

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

  const loadExistingDrawings = (L: any, drawingLayer: any) => {
    drawings.forEach((drawing) => {
      const color = drawing.color || getColorForMode(drawing.type)
      
      switch (drawing.type) {
        case "polygon":
          const polygon = L.polygon(drawing.coordinates, {
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          }).addTo(drawingLayer)
          polygon.bindPopup(createDrawingPopup(drawing))
          break
          
        case "rectangle":
          const rectangle = L.rectangle(drawing.coordinates, {
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          }).addTo(drawingLayer)
          rectangle.bindPopup(createDrawingPopup(drawing))
          break
          
        case "circle":
          const circle = L.circle(drawing.coordinates.center, {
            radius: drawing.coordinates.radius,
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          }).addTo(drawingLayer)
          circle.bindPopup(createDrawingPopup(drawing))
          break
          
        case "marker":
          const marker = L.marker(drawing.coordinates, {
            icon: L.divIcon({
              html: `
                <div style="
                  background-color: ${color};
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
              `,
              className: "drawing-marker",
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })
          }).addTo(drawingLayer)
          marker.bindPopup(createDrawingPopup(drawing))
          break
          
        case "line":
          const line = L.polyline(drawing.coordinates, {
            color,
            weight: 3
          }).addTo(drawingLayer)
          line.bindPopup(createDrawingPopup(drawing))
          break
      }
    })
  }

  const createDrawingPopup = (drawing: DrawingElement) => {
    return `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; font-weight: bold;">${drawing.type.toUpperCase()}</h4>
        ${drawing.produto ? `<p style="margin: 0 0 4px 0;"><strong>Produto:</strong> ${drawing.produto}</p>` : ''}
        ${drawing.observacao ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">${drawing.observacao}</p>` : ''}
      </div>
    `
  }

  const setupDrawingTools = (L: any, map: any, drawingLayer: any) => {
    let currentDrawing: any = null
    let isDrawing = false

    // Função para limpar desenhos
    const clearDrawings = () => {
      drawingLayer.clearLayers()
      setDrawings([])
      loadExistingDrawings(L, drawingLayer)
    }

    // Função para salvar desenhos
    const saveDrawings = async () => {
      const layers = drawingLayer.getLayers()
      const drawingsData = layers.map((layer: any) => {
        if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
          return {
            type: "polygon",
            coordinates: layer.getLatLngs()[0].map((latlng: any) => [latlng.lat, latlng.lng]),
            color: layer.options.color,
          }
        } else if (layer instanceof L.Rectangle) {
          return {
            type: "rectangle",
            coordinates: layer.getBounds(),
            color: layer.options.color,
          }
        } else if (layer instanceof L.Circle) {
          return {
            type: "circle",
            coordinates: {
              center: [layer.getLatLng().lat, layer.getLatLng().lng],
              radius: layer.getRadius()
            },
            color: layer.options.color,
          }
        } else if (layer instanceof L.Marker) {
          return {
            type: "marker",
            coordinates: [layer.getLatLng().lat, layer.getLatLng().lng],
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

      try {
        if (obra) {
          await obrasService.update(obra.id, { mapeamento: drawingsData })
          toast({
            title: "Mapeamento salvo!",
            description: "Os desenhos foram salvos na obra."
          })
        }
      } catch (error) {
        toast({
          title: "Erro ao salvar mapeamento",
          description: String(error),
          variant: "destructive"
        })
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
        setDrawings(prev => [...prev, {
          id: Date.now().toString(),
          type: currentMode,
          coordinates: newDrawing.getLatLng ? [newDrawing.getLatLng().lat, newDrawing.getLatLng().lng] : [],
          color
        }])
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar com ferramentas */}
        <div className="w-80 bg-white border-r p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Informações da obra */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações da Obra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">OS</Label>
                  <p className="text-sm text-muted-foreground">{obra.os}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Endereço</Label>
                  <p className="text-sm text-muted-foreground">{obra.endereco}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-muted-foreground">{obra.descricaoServico}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Progresso</Label>
                  <p className="text-sm text-muted-foreground">{obra.progresso}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Ferramentas de desenho */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ferramentas de Desenho</CardTitle>
                <CardDescription>Selecione uma ferramenta para desenhar no mapa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={currentMode === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeChange("select")}
                  className="w-full justify-start"
                >
                  <MousePointer className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
                
                <Button
                  variant={currentMode === "marker" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeChange("marker")}
                  className="w-full justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Marcador
                </Button>
                
                <Button
                  variant={currentMode === "polygon" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeChange("polygon")}
                  className="w-full justify-start"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Polígono
                </Button>
                
                <Button
                  variant={currentMode === "rectangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeChange("rectangle")}
                  className="w-full justify-start"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Retângulo
                </Button>
                
                <Button
                  variant={currentMode === "circle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeChange("circle")}
                  className="w-full justify-start"
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Círculo
                </Button>
                
                <Button
                  variant={currentMode === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModeChange("line")}
                  className="w-full justify-start"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Linha
                </Button>
              </CardContent>
            </Card>

            {/* Produto e observações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Produto/Observações</CardTitle>
                <CardDescription>Adicione informações ao elemento selecionado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="produto">Produto</Label>
                  <Input
                    id="produto"
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    placeholder="Ex: Cimento, Areia, Tijolo..."
                  />
                </div>
                <div>
                  <Label htmlFor="observacao">Observação</Label>
                  <Textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Observações sobre o elemento..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleSaveDrawings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Mapeamento
                </Button>
                
                <Button variant="outline" onClick={handleClearDrawings} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar Desenhos
                </Button>
              </CardContent>
            </Card>
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
          
          {/* Indicador do modo atual */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getColorForMode(currentMode) }}
              ></div>
              <span className="text-sm font-medium capitalize">{currentMode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 