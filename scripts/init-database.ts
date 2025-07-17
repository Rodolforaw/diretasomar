import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBS0ZP87UioNGDPAG4vGSidyng6R3NAKtQ",
  authDomain: "diretasomar.firebaseapp.com",
  projectId: "diretasomar",
  storageBucket: "diretasomar.firebasestorage.app",
  messagingSenderId: "982461737715",
  appId: "1:982461737715:web:ef9215876331611c5f2586",
  measurementId: "G-G4L4V5B8JW",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Dados de exemplo para responsáveis técnicos
const responsaveisExemplo = [
  {
    nome: "João Silva",
    email: "joao.silva@marica.rj.gov.br",
    telefone: "(21) 99999-1111",
    especialidade: "Engenheiro Civil",
    ativo: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    nome: "Maria Santos",
    email: "maria.santos@marica.rj.gov.br",
    telefone: "(21) 99999-2222",
    especialidade: "Arquiteta",
    ativo: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    nome: "Pedro Oliveira",
    email: "pedro.oliveira@marica.rj.gov.br",
    telefone: "(21) 99999-3333",
    especialidade: "Mestre de Obras",
    ativo: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    nome: "Ana Costa",
    email: "ana.costa@marica.rj.gov.br",
    telefone: "(21) 99999-4444",
    especialidade: "Engenheira Civil",
    ativo: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
]

// Dados de exemplo para obras
const obrasExemplo = [
  {
    os: "OS-2024-001",
    criticidade: "Prioridade",
    responsavelTecnicoId: "", // Será preenchido após criar responsáveis
    tipo: "Construção/Investimento",
    descricaoServico: "Construção de escola municipal no Centro",
    observacao: "Obra de grande importância para a comunidade",
    distrito: "Centro",
    endereco: "Rua das Flores, 123 - Centro, Maricá",
    latitude: -22.9213,
    longitude: -42.8186,
    localDivergente: "",
    localReferencia: "Próximo à Praça Central",
    inicioPrevisto: Timestamp.fromDate(new Date("2024-01-15")),
    conclusaoPrevista: Timestamp.fromDate(new Date("2024-06-30")),
    status: "em_andamento",
    progresso: 45,
    materiais: [
      {
        id: "mat1",
        nome: "Cimento",
        unidade: "Sacos",
        quantidade: 500,
        valorUnitario: 35.00,
        valorTotal: 17500.00,
        fornecedor: "Cimento Nacional",
        observacoes: "Cimento CP-II",
      },
      {
        id: "mat2",
        nome: "Areia",
        unidade: "m³",
        quantidade: 100,
        valorUnitario: 120.00,
        valorTotal: 12000.00,
        fornecedor: "Areia Maricá",
        observacoes: "Areia média lavada",
      },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    os: "OS-2024-002",
    criticidade: "Normal",
    responsavelTecnicoId: "", // Será preenchido após criar responsáveis
    tipo: "Reforma/Consumo",
    descricaoServico: "Reforma da quadra poliesportiva",
    observacao: "Melhoria da infraestrutura esportiva",
    distrito: "Araçatiba",
    endereco: "Av. Principal, 456 - Araçatiba, Maricá",
    latitude: -22.9150,
    longitude: -42.8250,
    localDivergente: "",
    localReferencia: "Próximo ao campo de futebol",
    inicioPrevisto: Timestamp.fromDate(new Date("2024-02-01")),
    conclusaoPrevista: Timestamp.fromDate(new Date("2024-04-30")),
    status: "planejada",
    progresso: 0,
    materiais: [
      {
        id: "mat3",
        nome: "Tinta Esportiva",
        unidade: "Galões",
        quantidade: 20,
        valorUnitario: 85.00,
        valorTotal: 1700.00,
        fornecedor: "Tintas Maricá",
        observacoes: "Tinta para piso esportivo",
      },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    os: "OS-2024-003",
    criticidade: "Prioridade",
    responsavelTecnicoId: "", // Será preenchido após criar responsáveis
    tipo: "Construção/Investimento",
    descricaoServico: "Pavimentação da Rua das Palmeiras",
    observacao: "Melhoria do acesso ao bairro",
    distrito: "Itaipuaçu",
    endereco: "Rua das Palmeiras, 789 - Itaipuaçu, Maricá",
    latitude: -22.9300,
    longitude: -42.8100,
    localDivergente: "",
    localReferencia: "Entrada do bairro",
    inicioPrevisto: Timestamp.fromDate(new Date("2024-01-20")),
    conclusaoPrevista: Timestamp.fromDate(new Date("2024-05-15")),
    status: "em_andamento",
    progresso: 70,
    materiais: [
      {
        id: "mat4",
        nome: "Asfalto",
        unidade: "Toneladas",
        quantidade: 50,
        valorUnitario: 450.00,
        valorTotal: 22500.00,
        fornecedor: "Asfalto RJ",
        observacoes: "Asfalto C-30",
      },
      {
        id: "mat5",
        nome: "Brita",
        unidade: "m³",
        quantidade: 80,
        valorUnitario: 95.00,
        valorTotal: 7600.00,
        fornecedor: "Brita Maricá",
        observacoes: "Brita 1",
      },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    os: "OS-2024-004",
    criticidade: "Normal",
    responsavelTecnicoId: "", // Será preenchido após criar responsáveis
    tipo: "Reforma/Consumo",
    descricaoServico: "Manutenção do sistema de iluminação pública",
    observacao: "Substituição de lâmpadas e reparos",
    distrito: "Barra de Maricá",
    endereco: "Av. Beira Mar, 321 - Barra de Maricá, Maricá",
    latitude: -22.9050,
    longitude: -42.8350,
    localDivergente: "",
    localReferencia: "Orla da praia",
    inicioPrevisto: Timestamp.fromDate(new Date("2024-03-01")),
    conclusaoPrevista: Timestamp.fromDate(new Date("2024-03-31")),
    status: "concluida",
    progresso: 100,
    materiais: [
      {
        id: "mat6",
        nome: "Lâmpadas LED",
        unidade: "Unidades",
        quantidade: 150,
        valorUnitario: 45.00,
        valorTotal: 6750.00,
        fornecedor: "Iluminação RJ",
        observacoes: "Lâmpadas LED 150W",
      },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
]

async function inicializarBanco() {
  try {
    console.log("🚀 Iniciando inicialização do banco de dados...")

    // 1. Criar responsáveis técnicos
    console.log("📝 Criando responsáveis técnicos...")
    const responsaveisIds: string[] = []
    
    for (const responsavel of responsaveisExemplo) {
      const docRef = await addDoc(collection(db, "responsaveis_tecnicos"), responsavel)
      responsaveisIds.push(docRef.id)
      console.log(`✅ Responsável criado: ${responsavel.nome} (ID: ${docRef.id})`)
    }

    // 2. Criar obras (associando aos responsáveis)
    console.log("🏗️ Criando obras...")
    
    for (let i = 0; i < obrasExemplo.length; i++) {
      const obra = obrasExemplo[i]
      // Associar responsável técnico (distribuir entre os responsáveis)
      const responsavelIndex = i % responsaveisIds.length
      obra.responsavelTecnicoId = responsaveisIds[responsavelIndex]
      
      const docRef = await addDoc(collection(db, "obras"), obra)
      console.log(`✅ Obra criada: ${obra.os} (ID: ${docRef.id})`)
    }

    console.log("🎉 Banco de dados inicializado com sucesso!")
    console.log(`📊 Resumo:`)
    console.log(`   - ${responsaveisIds.length} responsáveis técnicos criados`)
    console.log(`   - ${obrasExemplo.length} obras criadas`)
    console.log(`   - Dados de exemplo prontos para uso`)

  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  inicializarBanco()
}

export { inicializarBanco } 