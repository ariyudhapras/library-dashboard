"use client"

import { usePathname } from "next/navigation"
import MemberHeader from "@/components/member-header"
import { AnimatePresence, motion } from "framer-motion"

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login-user" || pathname === "/register"

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <MemberHeader />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>
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