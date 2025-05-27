"use client"

import "../globals.css"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MailQuestion, 
  ArchiveRestore, 
  FileText, 
  Home, 
  LogOut 
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    redirect("/login")
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-50 p-4 border-r border-slate-200">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-sm text-slate-500 mt-1">Perpustakaan Digital</p>
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center p-2.5 rounded-lg transition-colors ${
              isActive("/admin/dashboard")
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link 
            href="/admin/books" 
            className={`flex items-center p-2.5 rounded-lg transition-colors ${
              isActive("/admin/books")
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Manajemen Buku
          </Link>
          <Link 
            href="/admin/members" 
            className={`flex items-center p-2.5 rounded-lg transition-colors ${
              isActive("/admin/members")
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Manajemen Anggota
          </Link>
          <Link 
            href="/admin/requests" 
            className={`flex items-center p-2.5 rounded-lg transition-colors ${
              isActive("/admin/requests")
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <MailQuestion className="w-5 h-5 mr-3" />
            Permintaan Peminjaman
          </Link>
          <Link 
            href="/admin/returns" 
            className={`flex items-center p-2.5 rounded-lg transition-colors ${
              isActive("/admin/returns")
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ArchiveRestore className="w-5 h-5 mr-3" />
            Pengembalian
          </Link>
          <Link 
            href="/admin/reports" 
            className={`flex items-center p-2.5 rounded-lg transition-colors ${
              isActive("/admin/reports")
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Laporan
          </Link>
          
          <div className="pt-4 mt-4 border-t border-slate-200">
            <Link 
              href="/beranda" 
              className="flex items-center p-2.5 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Home className="w-5 h-5 mr-3" />
              Kembali ke Beranda
            </Link>
            
            <LogoutButton 
              variant="ghost" 
              className="flex items-center p-2.5 text-red-600 mt-2 rounded-lg hover:bg-red-50 w-full text-left transition-colors" 
              showIcon={false}
            />
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 bg-white">
        {children}
      </div>
    </div>
  )
} 