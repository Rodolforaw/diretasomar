"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CreateObraData, Obra, ResponsavelTecnico, Material } from "@/types/obra"
import { obrasService } from "@/services/obras"
import { responsaveisTecnicosService } from "@/services/responsaveis-tecnicos"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, MapPin, Package } from "lucide-react"
import { MapaSelecao } from "./mapa-selecao"
import { MateriaisForm } from "./materiais-form"

interface ObraFormProps {
  obra?: Obra
  onSuccess?: () => void
  onCancel?: () => void
}

// Bairros de Maricá organizados por região
const bairrosMarica = [
  "Centro",
  "Araçatiba",
  "Barra de Maricá",
  "Boqueirão",
  "Cordeirinho",
  "Flamengo",
  "Guaratiba",
  "Inoã",
  "Itaipuaçu",
  "Itapeba",
  "Jacaroá",
  "Mumbuca",
  "Ponta Negra",
  "Retiro",
  "Santa Rita",
  "São José do Imbassaí",
  "Ubatiba",
  "Bambuí",
  "Espraiado",
  "Jardim Atlântico",
  "Pindobas",
  "Praia de Fora",
  "Recanto de Itaipuaçu",
  "Zacarias",
].sort()

export function ObraForm({ obra, onSuccess, onCancel }: ObraFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [responsaveis, setResponsaveis] = useState<ResponsavelTecnico[]>([])
  const [formData, setFormData] = useState<CreateObraData>({
    os: obra?.os || "",
    criticidade: obra?.criticidade || "Normal",
    responsavelTecnicoId: obra?.responsavelTecnicoId || "",
    tipo: obra?.tipo || "Construção/Investimento",
    descricaoServico: obra?.descricaoServico || "",
    observacao: obra?.observacao || "",
    distrito: obra?.distrito || "",
    endereco: obra?.endereco || "",
    latitude: obra?.latitude || -22.9213, // Centro de Maricá
    longitude: obra?.longitude || -42.8186,
    localDivergente: obra?.localDivergente || "",
    localReferencia: obra?.localReferencia || "",
    inicioPrevisto: obra?.inicioPrevisto || new Date(),
    conclusaoPrevista: obra?.conclusaoPrevista || new Date(),
    materiais: obra?.materiais || [],
  })

  useEffect(() => {
    const unsubscribe = responsaveisTecnicosService.onSnapshot((responsaveisData) => {
      setResponsaveis(responsaveisData)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar coordenadas para região de Maricá (aproximadamente)
      if (formData.latitude < -23.1 || formData.latitude > -22.8) {
        throw new Error("Localização deve estar dentro da região de Maricá")
      }
      if (formData.longitude < -42.9 || formData.longitude > -42.7) {
        throw new Error("Localização deve estar dentro da região de Maricá")
      }

      if (obra) {
        await obrasService.update(obra.id, formData)
        toast({
          title: "Obra atualizada",
          description: "A obra foi atualizada com sucesso.",
        })
      } else {
        await obrasService.create(formData)
        toast({
          title: "Obra criada",
          description: "A obra foi criada com sucesso.",
        })
      }
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a obra.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location: {
    coordenadas: { lat: number; lng: number }
    endereco: string
    bairro: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: location.coordenadas.lat,
      longitude: location.coordenadas.lng,
      endereco: location.endereco,
      distrito: location.bairro,
    }))
  }

  const handleMateriaisChange = (materiais: Material[]) => {
    setFormData((prev) => ({ ...prev, materiais }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{obra ? "Editar Obra" : "Nova Obra"}</CardTitle>
        <CardDescription>
          {obra ? "Atualize as informações da obra" : "Preencha os dados para cadastrar uma nova obra em Maricá"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geral" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações Gerais
              </TabsTrigger>
              <TabsTrigger value="localizacao" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </TabsTrigger>
              <TabsTrigger value="materiais" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Materiais
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="os">O.S (Ordem de Serviço)</Label>
                  <Input
                    id="os"
                    value={formData.os}
                    onChange={(e) => setFormData((prev) => ({ ...prev, os: e.target.value }))}
                    placeholder="Ex: OS-2024-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="criticidade">Criticidade</Label>
                  <Select
                    value={formData.criticidade}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, criticidade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Prioridade">Prioridade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavelTecnicoId">Responsável Técnico</Label>
                  <Select
                    value={formData.responsavelTecnicoId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, responsavelTecnicoId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((responsavel) => (
                        <SelectItem key={responsavel.id} value={responsavel.id}>
                          {responsavel.nome} - {responsavel.especialidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construção/Investimento">Construção/Investimento</SelectItem>
                      <SelectItem value="Reforma/Consumo">Reforma/Consumo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricaoServico">Descrição do Serviço</Label>
                <Textarea
                  id="descricaoServico"
                  value={formData.descricaoServico}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descricaoServico: e.target.value }))}
                  placeholder="Descreva detalhadamente o serviço a ser executado"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Observações adicionais sobre a obra"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inicioPrevisto">Início Previsto</Label>
                  <Input
                    id="inicioPrevisto"
                    type="date"
                    value={formData.inicioPrevisto.toISOString().split("T")[0]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, inicioPrevisto: new Date(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="conclusaoPrevista">Conclusão Prevista</Label>
                  <Input
                    id="conclusaoPrevista"
                    type="date"
                    value={formData.conclusaoPrevista.toISOString().split("T")[0]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, conclusaoPrevista: new Date(e.target.value) }))}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="localizacao" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="distrito">Bairro</Label>
                <Select
                  value={formData.distrito}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, distrito: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {bairrosMarica.map((bairro) => (
                      <SelectItem key={bairro} value={bairro}>
                        {bairro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <MapaSelecao
                onLocationSelect={handleLocationSelect}
                initialLocation={
                  formData.latitude !== -22.9213 || formData.longitude !== -42.8186
                    ? {
                        coordenadas: { lat: formData.latitude, lng: formData.longitude },
                        endereco: formData.endereco,
                        bairro: formData.distrito,
                      }
                    : undefined
                }
              />

              <div>
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço será preenchido automaticamente ao selecionar no mapa"
                  rows={2}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Você pode editar o endereço para remover informações desnecessárias
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, latitude: Number.parseFloat(e.target.value) || 0 }))
                    }
                    required
                    min="-23.1"
                    max="-22.8"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, longitude: Number.parseFloat(e.target.value) || 0 }))
                    }
                    required
                    min="-42.9"
                    max="-42.7"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="localDivergente">Local Divergente</Label>
                <Input
                  id="localDivergente"
                  value={formData.localDivergente}
                  onChange={(e) => setFormData((prev) => ({ ...prev, localDivergente: e.target.value }))}
                  placeholder="Caso o local seja diferente do endereço principal"
                />
              </div>

              <div>
                <Label htmlFor="localReferencia">Local de Referência</Label>
                <Input
                  id="localReferencia"
                  value={formData.localReferencia}
                  onChange={(e) => setFormData((prev) => ({ ...prev, localReferencia: e.target.value }))}
                  placeholder="Ponto de referência próximo à obra (ex: próximo ao posto de saúde)"
                />
              </div>
            </TabsContent>

            <TabsContent value="materiais" className="mt-6">
              <MateriaisForm materiais={formData.materiais} onMateriaisChange={handleMateriaisChange} />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-6 border-t mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : obra ? (
                "Atualizar Obra"
              ) : (
                "Criar Obra"
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
