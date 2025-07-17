export interface ResponsavelTecnico {
  id: string
  nome: string
  email: string
  telefone: string
  especialidade: string
  ativo: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface Material {
  id: string
  nome: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  fornecedor?: string
  observacoes?: string
}

export interface Obra {
  id: string
  os: string // Ordem de Serviço
  criticidade: "Normal" | "Prioridade"
  responsavelTecnicoId: string
  responsavelTecnico?: ResponsavelTecnico // Populated field
  tipo: "Construção/Investimento" | "Reforma/Consumo"
  descricaoServico: string
  observacao?: string
  distrito: string
  endereco: string
  latitude: number
  longitude: number
  localDivergente?: string
  localReferencia?: string
  inicioPrevisto: Date | null
  conclusaoPrevista: Date | null
  status: "planejada" | "em_andamento" | "concluida" | "pausada"
  progresso: number
  materiais: Material[]
  createdAt: Date | null
  updatedAt: Date | null
  mapeamento?: any[] // Desenhos do mapa (polígonos, linhas, marcadores, etc)
}

export interface CreateObraData {
  os: string
  criticidade: Obra["criticidade"]
  responsavelTecnicoId: string
  tipo: Obra["tipo"]
  descricaoServico: string
  observacao?: string
  distrito: string
  endereco: string
  latitude: number
  longitude: number
  localDivergente?: string
  localReferencia?: string
  inicioPrevisto: Date
  conclusaoPrevista: Date
  materiais: Material[]
}

export interface CreateResponsavelTecnicoData {
  nome: string
  email: string
  telefone: string
  especialidade: string
}
