"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "./LoadingSpinner"

export function SessionWrapper({ children }: { children: React.ReactNode }) {
  const { status, update } = useSession()
  const [mounted, setMounted] = useState(false)

  // Debug log untuk session status
  useEffect(() => {
    console.log('SessionWrapper - Session status:', status)
  }, [status])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Force session update when mounted and periodically
  useEffect(() => {
    if (mounted) {
      update()
      // Update session every 5 minutes
      const interval = setInterval(() => {
        update()
      }, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [mounted, update])

  if (!mounted) {
    return <LoadingSpinner />
  }

  if (status === "loading") {
    return <LoadingSpinner />
  }

  return (
    <div 
      className="auth-transition"
      style={{ 
        opacity: status === "authenticated" ? 1 : 0,
        transition: "opacity 0.3s ease-in-out"
      }}
    >
      {children}
    </div>
  )
} 