"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Menu, User, BookMarked, Clock, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Beranda", href: "/beranda", icon: BookOpen },
  { name: "Peminjaman Saya", href: "/peminjaman", icon: BookMarked },
  { name: "Riwayat", href: "/riwayat", icon: Clock },
]

export default function MemberHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    setIsLoggingOut(true)
    
    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
      window.location.replace("/login");
    } catch (error) {
      console.error('Logout error:', error)
      window.location.replace("/login");
    }
  }

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Logging out...</span>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/beranda" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-bold">Perpustakaan Digital</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Avatar className="hidden h-8 w-8 md:flex">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Budi Santoso</p>
                      <p className="text-xs text-muted-foreground">budi.santoso@email.com</p>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                          pathname === item.href ? "bg-accent" : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Profil Saya
                    </Button>
                    <Button 
                      variant="outline" 
                      className="mt-2 w-full justify-start text-red-600" 
                      size="sm"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Keluar...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
