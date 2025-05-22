"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Redirect if already logged in based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Regular login redirect based on user role
      if (session.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/beranda")
      }
    }
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Use the signIn method from NextAuth
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.error) {
        setError("Email atau password salah")
        setIsLoading(false)
        return
      }

      // Success - the session will be updated automatically
      // The redirect will be handled by the useEffect above
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan. Silakan coba lagi.")
      setIsLoading(false)
    }
  }

  // If loading session, show loading state
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side */}
      <div className="bg-blue-600 text-white p-8 md:w-1/2 flex flex-col justify-center items-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6 text-center">Perpustakaan Digital</h1>
          <p className="text-xl mb-8 text-center">
            Akses ribuan koleksi buku digital dan kelola peminjaman dengan mudah
          </p>
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm text-center my-8">
            <p className="italic text-white/90 mb-4">
              "Membaca adalah jendela dunia, dan perpustakaan adalah pintunya."
            </p>
            <p className="font-semibold">- Pustakawan</p>
          </div>
          <p className="text-sm text-center text-white/60 mt-8">
            © 2024 Perpustakaan Digital. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Right Side */}
      <div className="bg-gray-50 p-6 md:w-1/2 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-auto border border-gray-200">
          <h2 className="text-2xl font-bold text-center mb-1">Login Anggota</h2>
          <p className="text-gray-600 text-center mb-6">
            Masukkan email dan password untuk mengakses sistem
          </p>
          
          {success === '1' && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <InfoIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <div className="p-3 mb-4 text-sm bg-red-50 text-red-600 rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  disabled={isLoading}
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
            </div>
            
            <div className="flex items-center mb-6">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Ingat saya
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Belum memiliki akun?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 