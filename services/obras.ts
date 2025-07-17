"use client"

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Obra, CreateObraData } from "@/types/obra"

// Função para converter Timestamp para Date
const toDateSafe = (value: any): Date | null => {
  if (!value) return null
  if (value?.toDate && typeof value.toDate === "function") return value.toDate()
  if (value instanceof Date) return value
  return null
}

const COLLECTION_NAME = "obras"

export const obrasService = {
  // Criar nova obra
  async create(data: CreateObraData): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: "planejada" as const,
      progresso: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  // Buscar todas as obras
  async getAll(): Promise<Obra[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const obras = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const obraData = docSnapshot.data()

        // Buscar responsável técnico se existir
        let responsavelTecnico = undefined
        if (obraData.responsavelTecnicoId) {
          try {
            const responsavelDoc = await getDoc(doc(db, "responsaveis_tecnicos", obraData.responsavelTecnicoId))
            if (responsavelDoc.exists()) {
              const responsavelData = responsavelDoc.data()
              responsavelTecnico = {
                id: responsavelDoc.id,
                ...responsavelData,
                createdAt: toDateSafe(responsavelData.createdAt),
                updatedAt: toDateSafe(responsavelData.updatedAt),
              }
            }
          } catch (error) {
            console.warn("Erro ao buscar responsável técnico:", error)
          }
        }

        return {
          id: docSnapshot.id,
          ...obraData,
          responsavelTecnico,
          inicioPrevisto: toDateSafe(obraData.inicioPrevisto),
          conclusaoPrevista: toDateSafe(obraData.conclusaoPrevista),
          createdAt: toDateSafe(obraData.createdAt),
          updatedAt: toDateSafe(obraData.updatedAt),
        }
      }),
    )

    return obras as Obra[]
  },

  // Atualizar obra
  async update(id: string, data: Record<string, any>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  },

  // Deletar obra
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  },

  // Escutar mudanças em tempo real
  onSnapshot(callback: (obras: Obra[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))

    return onSnapshot(q, async (querySnapshot) => {
      const obras = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const obraData = docSnapshot.data()

          // Buscar responsável técnico se existir
          let responsavelTecnico = undefined
          if (obraData.responsavelTecnicoId) {
            try {
              const responsavelDoc = await getDoc(doc(db, "responsaveis_tecnicos", obraData.responsavelTecnicoId))
              if (responsavelDoc.exists()) {
                const responsavelData = responsavelDoc.data()
                responsavelTecnico = {
                  id: responsavelDoc.id,
                  ...responsavelData,
                  createdAt: toDateSafe(responsavelData.createdAt),
                  updatedAt: toDateSafe(responsavelData.updatedAt),
                }
              }
            } catch (error) {
              console.warn("Erro ao buscar responsável técnico:", error)
            }
          }

          return {
            id: docSnapshot.id,
            ...obraData,
            responsavelTecnico,
            inicioPrevisto: toDateSafe(obraData.inicioPrevisto),
            conclusaoPrevista: toDateSafe(obraData.conclusaoPrevista),
            createdAt: toDateSafe(obraData.createdAt),
            updatedAt: toDateSafe(obraData.updatedAt),
          }
        }),
      )

      callback(obras as Obra[])
    })
  },
}
