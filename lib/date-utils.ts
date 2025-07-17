export function formatDateSafe(date: any): string {
  if (!date) return "-"

  try {
    // Se já é uma string de data formatada, retorna ela mesma
    if (typeof date === "string" && date.includes("/")) {
      return date
    }

    // Se é um timestamp do Firestore
    if (date && typeof date === "object" && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString("pt-BR")
    }

    // Se é uma string ISO ou timestamp
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "-"
    }

    return dateObj.toLocaleDateString("pt-BR")
  } catch (error) {
    console.warn("Erro ao formatar data:", error)
    return "-"
  }
}

export function formatCurrency(value: number): string {
  if (!value || isNaN(value)) return "R$ 0,00"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDateTime(date: any): string {
  if (!date) return "-"

  try {
    // Se é um timestamp do Firestore
    if (date && typeof date === "object" && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString("pt-BR")
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "-"
    }

    return dateObj.toLocaleString("pt-BR")
  } catch (error) {
    console.warn("Erro ao formatar data/hora:", error)
    return "-"
  }
}

export function isValidDate(date: any): boolean {
  if (!date) return false

  try {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  } catch {
    return false
  }
}
