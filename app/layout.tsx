import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseProvider } from "@/components/firebase-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Diretas Somar - Controle de Obras",
  description: "Sistema de controle e monitoramento de obras em campo para Maricá",
  keywords: ["obras", "construção", "maricá", "controle", "monitoramento"],
  authors: [{ name: "Diretas Somar" }],
  creator: "Diretas Somar",
  publisher: "Diretas Somar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Diretas Somar",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Diretas Somar - Controle de Obras",
    description: "Sistema de controle e monitoramento de obras em campo",
    siteName: "Diretas Somar",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#970700",
  colorScheme: "light",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <FirebaseProvider>
          <SidebarProvider defaultOpen={false}>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
            </div>
          </SidebarProvider>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  )
}
