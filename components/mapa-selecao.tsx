"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Layers, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Coordenadas {
  lat: number
  lng: number
}

interface MapaSelecaoProps {
  onLocationSelect: (location: { coordenadas: Coordenadas; endereco: string; bairro: string }) => void
  initialLocation?: { coordenadas: Coordenadas; endereco: string; bairro: string }
}

export function MapaSelecao({ onLocationSelect, initialLocation }: MapaSelecaoProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const layersRef = useRef<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentLayer, setCurrentLayer] = useState<"street" | "satellite">("street")
  const [selectedLocation, setSelectedLocation] = useState<{
    coordenadas: Coordenadas
    endereco: string
    bairro: string
  } | null>(initialLocation || null)

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

        // Posição inicial (Maricá ou localização inicial)
        const initialCoords = initialLocation?.coordenadas || { lat: -22.9213, lng: -42.8186 }

        // Criar o mapa
        const map = L.map(mapRef.current, {
          center: [initialCoords.lat, initialCoords.lng],
          zoom: 13,
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

        // Adicionar marcador inicial se houver
        if (initialLocation) {
          const marker = L.marker([initialCoords.lat, initialCoords.lng], {
            draggable: true,
          })
            .addTo(map)
            .bindPopup(`
              <div class="p-2">
                <p class="font-semibold">${initialLocation.endereco}</p>
                <p class="text-sm text-gray-600">${initialLocation.bairro}</p>
              </div>
            `)
          markerRef.current = marker

          // Evento de arrastar marcador
          marker.on("dragend", async (e: any) => {
            const { lat, lng } = e.target.getLatLng()
            await handleLocationClick(lat, lng, L, map)
          })
        }

        // Adicionar evento de clique no mapa
        map.on("click", async (e: any) => {
          const { lat, lng } = e.latlng
          await handleLocationClick(lat, lng, L, map)
        })

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
  }, [])

  const handleLocationClick = async (lat: number, lng: number, L: any, map: any) => {
    try {
      // Geocodificação reversa usando Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`,
      )
      const data = await response.json()

      const endereco = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      const bairro =
        data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || "Não identificado"

      const location = {
        coordenadas: { lat, lng },
        endereco,
        bairro,
      }

      setSelectedLocation(location)

      // Remover marcador anterior
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Adicionar novo marcador
      const marker = L.marker([lat, lng], {
        draggable: true,
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <p class="font-semibold">${endereco}</p>
            <p class="text-sm text-gray-600">${bairro}</p>
          </div>
        `)
        .openPopup()

      // Evento de arrastar marcador
      marker.on("dragend", async (e: any) => {
        const { lat: newLat, lng: newLng } = e.target.getLatLng()
        await handleLocationClick(newLat, newLng, L, map)
      })

      markerRef.current = marker
    } catch (error) {
      console.error("Erro na geocodificação:", error)
      const location = {
        coordenadas: { lat, lng },
        endereco: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        bairro: "Não identificado",
      }
      setSelectedLocation(location)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim() || !mapInstanceRef.current) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm + " Maricá RJ")}&limit=1&accept-language=pt-BR&countrycodes=br`,
      )
      const data = await response.json()

      if (data.length > 0) {
        const result = data[0]
        const lat = Number.parseFloat(result.lat)
        const lng = Number.parseFloat(result.lon)

        // Mover o mapa para a localização encontrada
        mapInstanceRef.current.setView([lat, lng], 16)

        const L = await loadLeaflet()
        await handleLocationClick(lat, lng, L, mapInstanceRef.current)
      }
    } catch (error) {
      console.error("Erro na busca:", error)
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

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selecionar Localização
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Selecionar Localização em Maricá
          </div>
          <Button onClick={toggleLayer} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Layers className="h-4 w-4" />
            {currentLayer === "street" ? "Satélite" : "Mapa"}
          </Button>
        </CardTitle>
        <CardDescription>
          Clique no mapa ou arraste o marcador para selecionar a localização da obra -{" "}
          {currentLayer === "street" ? "Vista de Rua" : "Vista de Satélite"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar endereço em Maricá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Mapa */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Carregando mapa...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="h-[400px] w-full rounded-lg border" style={{ minHeight: "400px" }} />

          {/* Indicador do modo atual */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm z-[1000]">
            {currentLayer === "street" ? "🗺️ Mapa" : "🛰️ Satélite"}
          </div>
        </div>

        {/* Localização selecionada */}
        {selectedLocation && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">Localização selecionada:</p>
            <p className="text-sm text-muted-foreground">{selectedLocation.endereco}</p>
            <p className="text-sm text-muted-foreground">Bairro: {selectedLocation.bairro}</p>
            <p className="text-xs text-muted-foreground">
              Coordenadas: {selectedLocation.coordenadas.lat.toFixed(6)}, {selectedLocation.coordenadas.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Botão de confirmação */}
        <Button onClick={handleConfirm} disabled={!selectedLocation} className="w-full">
          Confirmar Localização
        </Button>
      </CardContent>
    </Card>
  )
}
