"use client"

import "../globals.css"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, BookOpen, Clock, Home, Book, LibraryBig, BookMarked, Menu } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstMenuRef = useRef<HTMLAnchorElement>(null)

  // Lock scroll pada body saat menu terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => document.body.classList.remove("overflow-hidden")
  }, [isMobileMenuOpen])

  // Fokus ke menu pertama saat menu terbuka, kembalikan ke hamburger saat tutup
  useEffect(() => {
    if (isMobileMenuOpen) {
      setTimeout(() => {
        firstMenuRef.current?.focus()
      }, 50)
    } else {
      hamburgerRef.current?.focus()
    }
  }, [isMobileMenuOpen])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const handleNavClick = () => setIsMobileMenuOpen(false)

  // Separate NavContent for reuse in mobile and desktop, with optional header
  const NavContent = ({ isMobile = false }) => (
    <>
      {isMobile && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Perpustakaan Digital</h2>
          <p className="text-sm text-slate-500 mt-1">Selamat datang, {session?.user?.name}</p>
        </div>
      )}
      <nav className="space-y-2">
        <Link
          href="/user/beranda"
          onClick={handleNavClick}
          ref={isMobile ? firstMenuRef : null} // Only set ref for mobile menu first item
          tabIndex={isMobile ? 0 : -1} // Only make focusable by default in mobile menu
          className={`flex items-center px-2.5 py-3 rounded-lg transition-colors ${
            pathname === "/user/beranda"
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Home className="w-5 h-5 mr-3" />
          Beranda
        </Link>
        <Link
          href="/user/katalog"
          onClick={handleNavClick}
          className={`flex items-center px-2.5 py-3 rounded-lg transition-colors ${
            pathname === "/user/katalog"
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Book className="w-5 h-5 mr-3" />
          Katalog Buku
        </Link>
        <Link
          href="/user/active-loans"
          onClick={handleNavClick}
          className={`flex items-center px-2.5 py-3 rounded-lg transition-colors ${
            pathname === "/user/active-loans"
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <BookMarked className="w-5 h-5 mr-3" />
          Peminjaman Aktif
        </Link>
        <Link
          href="/user/history"
          onClick={handleNavClick}
          className={`flex items-center px-2.5 py-3 rounded-lg transition-colors ${
            pathname === "/user/history"
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Clock className="w-5 h-5 mr-3" />
          Riwayat Peminjaman
        </Link>
        <Link
          href="/user/profile"
          onClick={handleNavClick}
          className={`flex items-center px-2.5 py-3 rounded-lg transition-colors ${
            pathname === "/user/profile"
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <User className="w-5 h-5 mr-3" />
          Profil Saya
        </Link>
        {session?.user?.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            onClick={handleNavClick}
            className="flex items-center px-2.5 py-3 mt-4 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Admin Panel
          </Link>
        )}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <LogoutButton
            variant="ghost"
            className="flex items-center px-2.5 py-3 text-red-600 rounded-lg hover:bg-red-50 w-full text-left transition-colors"
          />
        </div>
      </nav>
    </>
  )

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between relative">
          <button
            ref={hamburgerRef}
            className="p-2 hover:bg-slate-100 rounded-lg absolute left-0"
            aria-label="Buka menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mx-auto text-center w-full flex items-center justify-center gap-2 pl-10">
            <span className="inline-block align-middle">
              {/* Logo Buku SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-accent-600 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75V18a2.25 2.25 0 002.25 2.25h15.25M2.25 6.75A2.25 2.25 0 014.5 4.5h15.25v15.75M2.25 6.75h15.25m0 0V18a2.25 2.25 0 01-2.25 2.25H4.5" />
              </svg>
            </span>
            Perpustakaan Digital
          </h2>
        </div>
      </div>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-slate-50 p-4 border-r border-slate-200">
        {/* Header Desktop */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="inline-block align-middle">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-accent-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75V18a2.25 2.25 0 002.25 2.25h15.25M2.25 6.75A2.25 2.25 0 014.5 4.5h15.25v15.75M2.25 6.75h15.25m0 0V18a2.25 2.25 0 01-2.25 2.25H4.5" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Perpustakaan Digital</h2>
          </div>
          <p className="text-sm text-slate-500">Selamat datang, {session?.user?.name}</p>
        </div>
        {/* Nav Content Desktop */}
        <NavContent isMobile={false} />
      </div>
      {/* Overlay & Sidebar Mobile */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-4 w-64 bg-slate-50 border-r border-slate-200">
          <NavContent isMobile={true} />
        </SheetContent>
      </Sheet>
      {/* Main Content */}
      <div className="flex-1 lg:ml-0 mt-16 lg:mt-0 p-4 lg:p-8 bg-white overflow-x-hidden">
        {children}
      </div>
    </div>
  )
} 