"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Package } from "lucide-react"
import type { Material } from "@/types/obra"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MateriaisFormProps {
  materiais: Material[]
  onMateriaisChange: (materiais: Material[]) => void
}

export function MateriaisForm({ materiais, onMateriaisChange }: MateriaisFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Omit<Material, "id" | "valorTotal">>({
    nome: "",
    unidade: "",
    quantidade: 0,
    valorUnitario: 0,
    fornecedor: "",
    observacoes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const valorTotal = formData.quantidade * formData.valorUnitario
    const novoMaterial: Material = {
      ...formData,
      id: editingIndex !== null ? materiais[editingIndex].id : Date.now().toString(),
      valorTotal,
    }

    let novosMateriais: Material[]
    if (editingIndex !== null) {
      novosMateriais = [...materiais]
      novosMateriais[editingIndex] = novoMaterial
    } else {
      novosMateriais = [...materiais, novoMaterial]
    }

    onMateriaisChange(novosMateriais)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      unidade: "",
      quantidade: 0,
      valorUnitario: 0,
      fornecedor: "",
      observacoes: "",
    })
    setEditingIndex(null)
    setShowForm(false)
  }

  const handleEdit = (index: number) => {
    const material = materiais[index]
    setFormData({
      nome: material.nome,
      unidade: material.unidade,
      quantidade: material.quantidade,
      valorUnitario: material.valorUnitario,
      fornecedor: material.fornecedor || "",
      observacoes: material.observacoes || "",
    })
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleDelete = (index: number) => {
    const novosMateriais = materiais.filter((_, i) => i !== index)
    onMateriaisChange(novosMateriais)
  }

  const valorTotalGeral = materiais.reduce((acc, material) => acc + material.valorTotal, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materiais da Obra
          </span>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIndex !== null ? "Editar Material" : "Adicionar Material"}</DialogTitle>
                <DialogDescription>Preencha as informações do material para controle de estoque</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Material</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Cimento Portland"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade</Label>
                    <Input
                      id="unidade"
                      value={formData.unidade}
                      onChange={(e) => setFormData((prev) => ({ ...prev, unidade: e.target.value }))}
                      placeholder="Ex: kg, m², unid"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantidade}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, quantidade: Number.parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                    <Input
                      id="valorUnitario"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorUnitario}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, valorUnitario: Number.parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fornecedor">Fornecedor (Opcional)</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fornecedor: e.target.value }))}
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações (Opcional)</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre o material"
                    rows={2}
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Valor Total:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(formData.quantidade * formData.valorUnitario)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingIndex !== null ? "Atualizar" : "Adicionar"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Controle de materiais necessários para a obra</CardDescription>
      </CardHeader>
      <CardContent>
        {materiais.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum material cadastrado</p>
            <p className="text-sm">Adicione materiais para melhor controle da obra</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materiais.map((material, index) => (
              <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{material.nome}</h4>
                    <Badge variant="secondary">{material.unidade}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Quantidade: {material.quantidade} {material.unidade} ×{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(material.valorUnitario)}{" "}
                      ={" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(material.valorTotal)}
                    </p>
                    {material.fornecedor && <p>Fornecedor: {material.fornecedor}</p>}
                    {material.observacoes && <p>Obs: {material.observacoes}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(index)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="border-t pt-3 mt-4">
              <div className="flex justify-between items-center font-medium">
                <span>Valor Total dos Materiais:</span>
                <span className="text-lg">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(valorTotalGeral)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
