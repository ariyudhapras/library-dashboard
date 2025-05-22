"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(true)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  // Validasi password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword)
    } else {
      setPasswordMatch(true) // Reset validation if confirmPassword is empty
    }
  }, [formData.password, formData.confirmPassword])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate password match before submitting
    if (!passwordMatch) {
      setError("Password dan konfirmasi password tidak sama")
      return
    }
    
    setError(null)
    setDebugInfo(null)
    setIsLoading(true)

    try {
      // Tambahkan timestamp untuk menghindari cache
      const res = await fetch(`/api/register?t=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      // Log response status
      console.log(`Register API response status: ${res.status}`)
      
      // Parse response ke JSON
      let data
      const responseText = await res.text()
      
      try {
        data = JSON.parse(responseText)
        console.log("Register API response data:", data)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        console.log("Raw response:", responseText)
        setDebugInfo(`Failed to parse response: ${responseText}`)
        throw new Error("Invalid response format from server")
      }

      if (!res.ok) {
        // Log error detail jika ada
        console.error("API error:", data.error || "Unknown error")
        throw new Error(data.error || "Something went wrong")
      }

      // Registration successful, redirect to login page with success message
      console.log("Registration successful, redirecting to login page")
      router.push("/login?success=1")
      
    } catch (error) {
      console.error("Registration error:", error)
      
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Daftar Anggota</CardTitle>
          <CardDescription>
            Buat akun baru untuk mengakses sistem perpustakaan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {debugInfo && (
              <div className="p-3 mb-4 text-xs bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 overflow-auto max-h-32">
                <p className="font-semibold">Debug Info:</p>
                <pre>{debugInfo}</pre>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                disabled={isLoading}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Minimal 6 karakter</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className={`pr-10 ${!passwordMatch && formData.confirmPassword ? "border-red-500" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <p className="text-xs text-red-500">Password tidak sama</p>
              )}
            </div>
            
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !passwordMatch || !formData.password || !formData.confirmPassword}
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
