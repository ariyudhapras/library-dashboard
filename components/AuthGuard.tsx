"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "./LoadingSpinner"
import { cn } from "@/lib/utils"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Debug log untuk session status
  useEffect(() => {
    console.log('AuthGuard - Session status:', status)
    console.log('AuthGuard - Session data:', session)
  }, [session, status])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated" && !isRedirecting && isMounted) {
      console.log('AuthGuard - User unauthenticated, redirecting to login...')
      setIsRedirecting(true)
      const returnUrl = encodeURIComponent(pathname)
      router.replace(`/login?callbackUrl=${returnUrl}`)
    }
  }, [status, router, pathname, isRedirecting, isMounted])

  // Force session update when mounted and periodically
  useEffect(() => {
    if (isMounted) {
      update()
      // Update session every 5 minutes
      const interval = setInterval(() => {
        update()
      }, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isMounted, update])

  // Show loading state while checking authentication or during initial mount
  if (!isMounted || status === "loading" || isRedirecting) {
    return <LoadingSpinner />
  }

  // Only render children if authenticated
  if (status === "authenticated") {
    return (
      <div 
        className={cn(
          "auth-transition",
          status === "authenticated" && "authenticated"
        )}
        style={{ 
          opacity: status === "authenticated" ? 1 : 0,
          transition: "opacity 0.3s ease-in-out"
        }}
      >
        {children}
      </div>
    )
  }

  return null
} 