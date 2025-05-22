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
            <div className="flex h-14 items-center px-4">
              <h2 className="text-lg font-semibold">Perpustakaan Digital</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Keluar...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
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
              <span className="text-sm font-medium">Admin</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
