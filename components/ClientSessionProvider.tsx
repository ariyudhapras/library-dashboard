"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { useEffect, useState } from "react"

export default function ClientSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: Session | null
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SessionProvider 
      session={session} 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
} 