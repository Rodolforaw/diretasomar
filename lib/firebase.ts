import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBS0ZP87UioNGDPAG4vGSidyng6R3NAKtQ",
  authDomain: "diretasomar.firebaseapp.com",
  projectId: "diretasomar",
  storageBucket: "diretasomar.firebasestorage.app",
  messagingSenderId: "982461737715",
  appId: "1:982461737715:web:ef9215876331611c5f2586",
  measurementId: "G-G4L4V5B8JW",
}

// Inicializar Firebase apenas uma vez
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp()
}

// Inicializar serviços
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Analytics (opcional, só no cliente)
export let analytics = null
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    try {
      analytics = getAnalytics(app)
    } catch (error) {
      console.log("Analytics não disponível")
    }
  })
}

export default app
