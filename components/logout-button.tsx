"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  showIcon?: boolean
  className?: string
}

export function LogoutButton({ 
  variant = "default", 
  showIcon = true,
  className = ""
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true)
    
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
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Logging out...</span>
          </div>
        </div>
      )}
      <Button 
        variant={variant}
        onClick={handleLogout}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Keluar...
          </>
        ) : (
          <>
            {showIcon && <LogOut className="mr-2 h-4 w-4" />}
            Logout
          </>
        )}
      </Button>
    </>
  )
} 