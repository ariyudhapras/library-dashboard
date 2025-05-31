"use client"

import Link from "next/link"
import { Home, Book, Heart, BookMarked, Clock, User, LibraryBig } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { usePathname } from "next/navigation"
import React from "react"

interface UserSidebarContentProps {
  user?: {
    name?: string
    role?: string
  }
  activePath?: string
  onNavClick?: () => void
  firstMenuRef?: React.RefObject<HTMLAnchorElement>
}

export function UserSidebarContent({ user, activePath, onNavClick, firstMenuRef }: UserSidebarContentProps) {
  const pathname = activePath || usePathname()
  const menu = [
    { href: "/user/beranda", label: "Beranda", icon: <Home className="w-5 h-5 lg:w-7 lg:h-7" /> },
    { href: "/user/katalog", label: "Katalog Buku", icon: <Book className="w-5 h-5 lg:w-7 lg:h-7" /> },
    { href: "/user/wishlist", label: "Wishlist", icon: <Heart className="w-5 h-5 lg:w-7 lg:h-7" /> },
    { href: "/user/active-loans", label: "Peminjaman Aktif", icon: <BookMarked className="w-5 h-5 lg:w-7 lg:h-7" /> },
    { href: "/user/history", label: "Riwayat Peminjaman", icon: <Clock className="w-5 h-5 lg:w-7 lg:h-7" /> },
    { href: "/user/profile", label: "Profil Saya", icon: <User className="w-5 h-5 lg:w-7 lg:h-7" /> },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 items-center py-8 border-b border-[#23263A] mb-4">
        <span className="inline-block align-middle rounded-full bg-white p-1 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2563eb" className="w-10 h-10 lg:w-12 lg:h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75V18a2.25 2.25 0 002.25 2.25h15.25M2.25 6.75A2.25 2.25 0 014.5 4.5h15.25v15.75M2.25 6.75h15.25m0 0V18a2.25 2.25 0 01-2.25 2.25H4.5" />
          </svg>
        </span>
        <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-white">Digital Library</h2>
        {user?.name && <p className="text-sm lg:text-lg text-[#A0AEC0] lg:mt-1">Selamat datang, {user.name}</p>}
      </div>
      {/* Menu */}
      <nav className="space-y-1 px-3">
        {menu.map((item, idx) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            ref={idx === 0 && firstMenuRef ? firstMenuRef : undefined}
            tabIndex={idx === 0 && firstMenuRef ? 0 : undefined}
            className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-base lg:text-xl gap-4 cursor-pointer select-none
              ${pathname === item.href
                ? "bg-[#23263A] text-white border-l-4 border-[#2563eb] shadow-sm"
                : "text-[#A0AEC0] hover:bg-[#23263A] hover:text-white hover:border-l-4 hover:border-[#2563eb]"}
            `}
            style={{ minHeight: 48 }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            onClick={onNavClick}
            className="flex items-center px-4 py-3 mt-4 rounded-lg font-medium transition-all duration-200 text-base gap-3 cursor-pointer select-none text-blue-400 hover:bg-blue-900/30 hover:text-blue-200"
            style={{ minHeight: 48 }}
          >
            <LibraryBig className="w-5 h-5" />
            Admin Panel
          </Link>
        )}
        <div className="pt-4 mt-4 border-t border-[#23263A]">
          <LogoutButton
            variant="ghost"
            className="flex items-center px-4 py-3 text-red-400 rounded-lg hover:bg-red-900/20 hover:text-red-200 w-full text-left transition-all duration-200 font-medium gap-3"
          />
        </div>
      </nav>
    </>
  )
} 