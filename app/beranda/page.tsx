"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BerandaRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/user/beranda")
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Redirecting to new page...</p>
      </div>
    </div>
  )
}
