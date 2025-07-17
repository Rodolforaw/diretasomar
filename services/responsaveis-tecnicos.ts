import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ResponsavelTecnico, CreateResponsavelTecnicoData } from "@/types/obra"

const COLLECTION_NAME = "responsaveis_tecnicos"

export const responsaveisTecnicosService = {
  async create(data: CreateResponsavelTecnicoData): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    })
    return docRef.id
  },

  async update(id: string, data: Partial<CreateResponsavelTecnicoData>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...data,
      atualizadoEm: new Date(),
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ativo: false,
      atualizadoEm: new Date(),
    })
  },

  async getAll(): Promise<ResponsavelTecnico[]> {
    const q = query(collection(db, COLLECTION_NAME), where("ativo", "==", true))
    const querySnapshot = await getDocs(q)

    const responsaveis = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ResponsavelTecnico[]

    // Ordenar por nome no cliente
    return responsaveis.sort((a, b) => a.nome.localeCompare(b.nome))
  },

  onSnapshot(callback: (responsaveis: ResponsavelTecnico[]) => void): Unsubscribe {
    const q = query(collection(db, COLLECTION_NAME), where("ativo", "==", true))

    return onSnapshot(q, (querySnapshot) => {
      const responsaveis = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ResponsavelTecnico[]

      // Ordenar por nome no cliente
      const responsaveisOrdenados = responsaveis.sort((a, b) => a.nome.localeCompare(b.nome))
      callback(responsaveisOrdenados)
    })
  },

  onSnapshotAll(callback: (responsaveis: ResponsavelTecnico[]) => void): Unsubscribe {
    const q = query(collection(db, COLLECTION_NAME))

    return onSnapshot(q, (querySnapshot) => {
      const responsaveis = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ResponsavelTecnico[]

      // Ordenar por nome no cliente
      const responsaveisOrdenados = responsaveis.sort((a, b) => a.nome.localeCompare(b.nome))
      callback(responsaveisOrdenados)
    })
  },
}
