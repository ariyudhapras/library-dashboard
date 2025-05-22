"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RiwayatRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/user/history")
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting to new page...</p>
    </div>
  )
}
