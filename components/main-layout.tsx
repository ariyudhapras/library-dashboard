"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Book, Users, ClipboardCheck, RotateCcw, FileBarChart, LogOut, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Data Buku",
      href: "/books",
      icon: <Book className="h-5 w-5" />,
    },
    {
      title: "Data Anggota",
      href: "/members",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Pengajuan",
      href: "/requests",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      title: "Pengembalian",
      href: "/returns",
      icon: <RotateCcw className="h-5 w-5" />,
    },
    {
      title: "Laporan",
      href: "/reports",
      icon: <FileBarChart className="h-5 w-5" />,
    },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    setIsLoggingOut(true)
    
    try {
      await signOut({ redirect: false, callbackUrl: '/login' });
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout error:', error)
      window.location.replace('/login');
    }
  }

  return (
    <SidebarProvider>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Logging out...</span>
          </div>
        </div>
      )}
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-6 py-6">
              <Image src="/logo.svg" alt="Logo Perpustakaan" width={40} height={40} className="h-10 w-10" />
              <h2 className="font-heading text-2xl font-extrabold tracking-tight text-white">Perpustakaan Digital</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      pathname === item.href
                        ? "bg-white/20 backdrop-blur-sm border-l-4 border-white font-semibold text-white"
                        : "hover:bg-white/10 hover:text-white text-white/80"
                    )}
                    aria-label={item.title}
                  >
                    <Link href={item.href} className="flex items-center gap-3 py-4 px-6">
                      <span className="w-6 h-6">{item.icon}</span>
                      <span className="text-lg font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <hr className="my-4 border-white/20" />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Logout"
                  className="mt-auto mb-4"
                >
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-4 px-6 w-full transition-all duration-300 ease-in-out hover:bg-white/10 text-white/80 hover:text-white"
                    disabled={isLoggingOut}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
                        <span className="text-lg font-medium">Keluar...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-6 w-6" aria-label="Logout Icon" />
                        <span className="text-lg font-medium">Logout</span>
                      </>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
            <SidebarTrigger className="mr-2" />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-base font-medium italic text-primary-600 dark:text-primary-400">Admin</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto px-6 py-6 md:px-8 md:py-8 max-w-[1920px] mx-auto w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
