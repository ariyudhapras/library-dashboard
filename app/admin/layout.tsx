"use client"

import "../globals.css"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, LogOut } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-500">Perpustakaan Digital</p>
        </div>
        
        <nav className="space-y-1">
          <Link href="/admin/dashboard" className="block p-2 rounded hover:bg-gray-200">
            Dashboard
          </Link>
          <Link href="/admin/books" className="block p-2 rounded hover:bg-gray-200">
            Manajemen Buku
          </Link>
          <Link href="/admin/members" className="block p-2 rounded hover:bg-gray-200">
            Manajemen Anggota
          </Link>
          <Link href="/admin/requests" className="block p-2 rounded hover:bg-gray-200">
            Permintaan Peminjaman
          </Link>
          <Link href="/admin/returns" className="block p-2 rounded hover:bg-gray-200">
            Pengembalian
          </Link>
          <Link href="/admin/reports" className="block p-2 rounded hover:bg-gray-200">
            Laporan
          </Link>
          <div className="pt-4 mt-4 border-t">
            <Link href="/beranda" className="flex items-center p-2 text-blue-600 hover:underline">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali ke Beranda
            </Link>
            
            <LogoutButton 
              variant="ghost" 
              className="flex items-center p-2 text-red-600 mt-2 rounded hover:bg-red-50 w-full text-left" 
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