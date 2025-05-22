"use client"

import { usePathname } from "next/navigation"
import MemberHeader from "@/components/member-header"

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login-user" || pathname === "/register"

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <MemberHeader />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && (
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Perpustakaan Digital. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  )
} 