"use client"

import "../globals.css"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, BookOpen, Clock, Home, Book, LibraryBig, BookMarked } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* User Sidebar */}
      <div className="w-64 bg-blue-50 p-4 border-r">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Perpustakaan Digital</h2>
          <p className="text-sm text-gray-500">Selamat datang, {session?.user?.name}</p>
        </div>
        
        <nav className="space-y-1">
          <Link href="/user/beranda" className="flex items-center p-2 rounded hover:bg-blue-100">
            <Home className="w-4 h-4 mr-2" />
            Beranda
          </Link>
          <Link href="/user/katalog" className="flex items-center p-2 rounded hover:bg-blue-100">
            <Book className="w-4 h-4 mr-2" />
            Katalog Buku
          </Link>
          <Link href="/user/active-loans" className="flex items-center p-2 rounded hover:bg-blue-100">
            <BookMarked className="w-4 h-4 mr-2" />
            Peminjaman Aktif
          </Link>
          <Link href="/user/history" className="flex items-center p-2 rounded hover:bg-blue-100">
            <Clock className="w-4 h-4 mr-2" />
            Riwayat Peminjaman
          </Link>
          <Link href="/user/profile" className="flex items-center p-2 rounded hover:bg-blue-100">
            <User className="w-4 h-4 mr-2" />
            Profil Saya
          </Link>
          
          {session?.user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="flex items-center p-2 mt-4 text-blue-700 font-medium rounded hover:bg-blue-100">
              Admin Panel
            </Link>
          )}
          
          <div className="mt-4">
            <LogoutButton 
              variant="ghost" 
              className="flex items-center p-2 text-red-600 rounded hover:bg-red-50 w-full text-left" 
            />
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
} 