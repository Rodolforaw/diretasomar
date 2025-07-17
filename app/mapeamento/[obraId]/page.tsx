"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Edit3, Square, Circle, MousePointer, Save, X, RotateCcw, ArrowLeft, Layers, Trash2, Settings } from "lucide-react"
import { obrasService } from "@/services/obras"
import { useToast } from "@/hooks/use-toast"
import type { Obra } from "@/types/obra"

interface DrawingElement {
  id: string
  type: string
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
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const [obra, setObra] = useState<Obra | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawings, setDrawings] = useState<DrawingElement[]>([])
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingElement | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [produto, setProduto] = useState("")
  const [observacao, setObservacao] = useState("")
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null)

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

  // Função para carregar Leaflet e Leaflet.Draw dinamicamente
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

      // Adicionar CSS do Leaflet.Draw
      if (!document.querySelector('link[href*="leaflet.draw"]')) {
        const drawLink = document.createElement("link")
        drawLink.rel = "stylesheet"
        drawLink.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
        document.head.appendChild(drawLink)
      }

      // Importar Leaflet e Leaflet.Draw
      const L = await import("leaflet")
      await import("leaflet-draw")

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
        const drawnItems = new L.FeatureGroup()
        drawnItemsRef.current = drawnItems
        map.addLayer(drawnItems)

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

        // Configurar controles de desenho
        const drawControl = new (L as any).Control.Draw({
          draw: {
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Polígono inválido!</strong>'
              },
              shapeOptions: {
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.3,
                weight: 2
              }
            },
            rectangle: {
              shapeOptions: {
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.3,
                weight: 2
              }
            },
            circle: {
              shapeOptions: {
                color: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.3,
                weight: 2
              }
            },
            marker: {
              icon: L.divIcon({
                html: `
                  <div style="
                    background-color: #EF4444;
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
            },
            polyline: {
              shapeOptions: {
                color: '#8B5CF6',
                weight: 3
              }
            }
          },
          edit: {
            featureGroup: drawnItems,
            remove: true
          }
        })

        drawControlRef.current = drawControl
        map.addControl(drawControl)

        // Eventos de desenho
        map.on('draw:created', (e: any) => {
          const layer = e.layer
          const type = e.layerType
          const drawingId = Date.now().toString()
          
          // Adicionar dados customizados ao layer
          layer.drawingId = drawingId
          layer.drawingType = type
          
          drawnItems.addLayer(layer)
          
          // Abrir dialog para adicionar produto/observação
          setCurrentDrawingId(drawingId)
          setProduto("")
          setObservacao("")
          setShowProductDialog(true)
        })

        map.on('draw:edited', (e: any) => {
          // Atualizar desenhos quando editados
          updateDrawingsFromLayers()
        })

        map.on('draw:deleted', (e: any) => {
          // Atualizar desenhos quando deletados
          updateDrawingsFromLayers()
        })

        mapInstanceRef.current = map
        setIsLoading(false)

        // Carregar desenhos existentes
        loadExistingDrawings(L, drawnItems)

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

  const loadExistingDrawings = (L: any, drawnItems: any) => {
    drawings.forEach((drawing) => {
      const color = drawing.color || getColorForType(drawing.type)
      
      switch (drawing.type) {
        case "polygon":
          const polygon = L.polygon(drawing.coordinates, {
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          })
          polygon.drawingId = drawing.id
          polygon.drawingType = "polygon"
          polygon.produto = drawing.produto
          polygon.observacao = drawing.observacao
          drawnItems.addLayer(polygon)
          break
          
        case "rectangle":
          const rectangle = L.rectangle(drawing.coordinates, {
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          })
          rectangle.drawingId = drawing.id
          rectangle.drawingType = "rectangle"
          rectangle.produto = drawing.produto
          rectangle.observacao = drawing.observacao
          drawnItems.addLayer(rectangle)
          break
          
        case "circle":
          const circle = L.circle(drawing.coordinates.center, {
            radius: drawing.coordinates.radius,
            color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          })
          circle.drawingId = drawing.id
          circle.drawingType = "circle"
          circle.produto = drawing.produto
          circle.observacao = drawing.observacao
          drawnItems.addLayer(circle)
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
          })
          marker.drawingId = drawing.id
          marker.drawingType = "marker"
          marker.produto = drawing.produto
          marker.observacao = drawing.observacao
          drawnItems.addLayer(marker)
          break
          
        case "polyline":
          const polyline = L.polyline(drawing.coordinates, {
            color,
            weight: 3
          })
          polyline.drawingId = drawing.id
          polyline.drawingType = "polyline"
          polyline.produto = drawing.produto
          polyline.observacao = drawing.observacao
          drawnItems.addLayer(polyline)
          break
      }
    })
  }

  const updateDrawingsFromLayers = () => {
    if (!drawnItemsRef.current) return
    
    const layers = drawnItemsRef.current.getLayers()
    const drawingsData = layers.map((layer: any) => {
      const drawingId = layer.drawingId || Date.now().toString()
      const type = layer.drawingType || getTypeFromLayer(layer)
      const color = layer.options?.color || getColorForType(type)
      
      let coordinates
      if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
        coordinates = layer.getLatLngs()[0].map((latlng: any) => [latlng.lat, latlng.lng])
      } else if (layer instanceof L.Rectangle) {
        coordinates = layer.getBounds()
      } else if (layer instanceof L.Circle) {
        coordinates = {
          center: [layer.getLatLng().lat, layer.getLatLng().lng],
          radius: layer.getRadius()
        }
      } else if (layer instanceof L.Marker) {
        coordinates = [layer.getLatLng().lat, layer.getLatLng().lng]
      } else if (layer instanceof L.Polyline) {
        coordinates = layer.getLatLngs().map((latlng: any) => [latlng.lat, latlng.lng])
      }

      return {
        id: drawingId,
        type,
        coordinates,
        color,
        produto: layer.produto,
        observacao: layer.observacao
      }
    }).filter(Boolean)

    setDrawings(drawingsData)
  }

  const getTypeFromLayer = (layer: any) => {
    if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) return "polygon"
    if (layer instanceof L.Rectangle) return "rectangle"
    if (layer instanceof L.Circle) return "circle"
    if (layer instanceof L.Marker) return "marker"
    if (layer instanceof L.Polyline) return "polyline"
    return "unknown"
  }

  const getColorForType = (type: string) => {
    const colors = {
      polygon: "#3B82F6",
      rectangle: "#10B981",
      circle: "#F59E0B",
      marker: "#EF4444",
      polyline: "#8B5CF6",
    }
    return colors[type as keyof typeof colors] || "#6B7280"
  }

  const handleSaveProduct = () => {
    if (!currentDrawingId || !drawnItemsRef.current) return

    const layers = drawnItemsRef.current.getLayers()
    const layer = layers.find((l: any) => l.drawingId === currentDrawingId)
    
    if (layer) {
      layer.produto = produto
      layer.observacao = observacao
      
      // Adicionar popup ao layer
      const popupContent = createDrawingPopup({
        id: currentDrawingId,
        type: layer.drawingType,
        coordinates: [],
        color: layer.options?.color || "#6B7280",
        produto,
        observacao
      })
      
      layer.bindPopup(popupContent)
    }

    setShowProductDialog(false)
    setCurrentDrawingId(null)
    setProduto("")
    setObservacao("")
    
    updateDrawingsFromLayers()
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

  const handleSaveDrawings = async () => {
    updateDrawingsFromLayers()
    
    try {
      if (obra) {
        await obrasService.update(obra.id, { mapeamento: drawings })
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

  const handleClearDrawings = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      setDrawings([])
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
        
        {/* Barra de ferramentas flutuante */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveDrawings} size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
            <Button onClick={handleClearDrawings} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Informações da obra flutuante */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-[1000] max-w-sm">
          <h3 className="font-semibold text-sm mb-2">Informações da Obra</h3>
          <div className="space-y-1 text-xs">
            <p><strong>OS:</strong> {obra.os}</p>
            <p><strong>Endereço:</strong> {obra.endereco}</p>
            <p><strong>Progresso:</strong> {obra.progresso}%</p>
            <p><strong>Status:</strong> {obra.status.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Dialog para adicionar produto/observação */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Informações ao Desenho</DialogTitle>
            <DialogDescription>
              Adicione produto e observações ao elemento desenhado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 