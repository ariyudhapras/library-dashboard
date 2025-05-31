import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import ClientSessionProvider from "@/components/ClientSessionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Perpustakaan Digital",
  description: "Sistem Manajemen Perpustakaan Digital",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ClientSessionProvider>
          <Providers>{children}</Providers>
          <Toaster />
        </ClientSessionProvider>
      </body>
    </html>
  )
}
