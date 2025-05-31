"use client"

import "../globals.css"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, BookOpen, Clock, Home, Book, LibraryBig, BookMarked, Menu, Heart } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar"
import { UserSidebarContent } from "@/components/ui/UserSidebarContent"

export const dynamic = 'force-dynamic'

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        {/* Sidebar as flex item */}
        <Sidebar
          className="w-[22rem] min-h-screen bg-[#181C2A] p-0 border-r border-[#23263A] shadow-lg hidden lg:block"
          collapsible="offcanvas"
          side="left"
        >
          <UserSidebarContent user={session?.user} activePath={pathname} />
        </Sidebar>
        {/* Sidebar Mobile Overlay */}
        {isMobileMenuOpen && (
          <Sidebar
            className="fixed inset-0 z-50 w-64 min-h-screen bg-[#181C2A] border-r border-[#23263A] shadow-lg lg:hidden"
            collapsible="offcanvas"
            side="left"
          >
            <UserSidebarContent user={session?.user} activePath={pathname} onNavClick={handleNavClick} firstMenuRef={firstMenuRef} />
          </Sidebar>
        )}
        {/* Main Content */}
        <SidebarInset>
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-12 py-8">
            {children}
            <Toaster position="top-center" richColors closeButton duration={3000} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 