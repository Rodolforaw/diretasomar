import * as XLSX from "xlsx"
import type { Obra } from "@/types/obra"
import type { ResponsavelTecnico } from "@/types/obra"

export function exportObrasToExcel(obras: Obra[], responsaveis: ResponsavelTecnico[] = []) {
  // Preparar dados para exportação
  const data = obras.map((obra) => {
    const responsavel = responsaveis.find((r) => r.id === obra.responsavel_tecnico_id)

    return {
      "O.S": obra.os || "",
      Nome: obra.nome || "",
      Endereço: obra.endereco || "",
      Bairro: obra.distrito || obra.bairro || "",
      Status: getStatusLabel(obra.status),
      Criticidade: getCriticidadeLabel(obra.criticidade),
      "Progresso (%)": obra.progresso || 0,
      "Responsável Técnico": responsavel?.nome || "Não informado",
      "Valor Total": formatCurrency(obra.valor_total || 0),
      "Data Início": obra.inicioPrevisto ? new Date(obra.inicioPrevisto).toLocaleDateString("pt-BR") : "",
      "Data Previsão": obra.conclusaoPrevista ? new Date(obra.conclusaoPrevista).toLocaleDateString("pt-BR") : "",
      Descrição: obra.descricaoServico || "",
      Observações: obra.observacao || "",
    }
  })

  // Criar workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 10 }, // O.S
    { wch: 25 }, // Nome
    { wch: 30 }, // Endereço
    { wch: 15 }, // Bairro
    { wch: 12 }, // Status
    { wch: 12 }, // Criticidade
    { wch: 10 }, // Progresso
    { wch: 20 }, // Responsável
    { wch: 15 }, // Valor
    { wch: 12 }, // Data Início
    { wch: 12 }, // Data Previsão
    { wch: 40 }, // Descrição
    { wch: 30 }, // Observações
  ]
  ws["!cols"] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, "Obras")

  // Gerar arquivo e fazer download
  downloadExcelFile(wb, `obras_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportSingleObraToExcel(obra: Obra) {
  const data = [
    {
      "O.S": obra.os || "",
      Nome: obra.nome || "",
      Endereço: obra.endereco || "",
      Bairro: obra.distrito || obra.bairro || "",
      Status: getStatusLabel(obra.status),
      Criticidade: getCriticidadeLabel(obra.criticidade),
      "Progresso (%)": obra.progresso || 0,
      "Responsável Técnico": obra.responsavelTecnico?.nome || "Não informado",
      "Valor Total": formatCurrency(obra.valor_total || 0),
      "Data Início": obra.inicioPrevisto ? new Date(obra.inicioPrevisto).toLocaleDateString("pt-BR") : "",
      "Data Previsão": obra.conclusaoPrevista ? new Date(obra.conclusaoPrevista).toLocaleDateString("pt-BR") : "",
      Descrição: obra.descricaoServico || "",
      Observações: obra.observacao || "",
    },
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 10 }, // O.S
    { wch: 25 }, // Nome
    { wch: 30 }, // Endereço
    { wch: 15 }, // Bairro
    { wch: 12 }, // Status
    { wch: 12 }, // Criticidade
    { wch: 10 }, // Progresso
    { wch: 20 }, // Responsável
    { wch: 15 }, // Valor
    { wch: 12 }, // Data Início
    { wch: 12 }, // Data Previsão
    { wch: 40 }, // Descrição
    { wch: 30 }, // Observações
  ]
  ws["!cols"] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, "Obra")

  downloadExcelFile(wb, `obra_${obra.os || "sem_os"}_${new Date().toISOString().split("T")[0]}.xlsx`)
}

function downloadExcelFile(workbook: XLSX.WorkBook, filename: string) {
  try {
    // Verificar se estamos no browser
    if (typeof window !== "undefined") {
      // Browser: usar Blob e download
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([wbout], { type: "application/octet-stream" })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      // Server/Node: usar writeFile (se disponível)
      XLSX.writeFile(workbook, filename)
    }
  } catch (error) {
    console.error("Erro ao exportar Excel:", error)
    throw new Error("Falha ao exportar arquivo Excel")
  }
}

function getStatusLabel(status: string) {
  const labels = {
    planejada: "Planejada",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    pausada: "Pausada",
  }
  return labels[status as keyof typeof labels] || status
}

function getCriticidadeLabel(criticidade: string) {
  const labels = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    Normal: "Normal",
    Prioridade: "Prioridade",
  }
  return labels[criticidade as keyof typeof labels] || criticidade
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}
