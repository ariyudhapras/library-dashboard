"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function RegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    birthDate: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    birthDate: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      address: "",
      phone: "",
      birthDate: "",
    }
    let isValid = true

    // Name validation - required
    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi"
      isValid = false
    }

    // Email validation - required
    if (!formData.email) {
      newErrors.email = "Email harus diisi"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
      isValid = false
    }

    // Password validation - required
    if (!formData.password) {
      newErrors.password = "Password harus diisi"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
      isValid = false
    }

    // Phone validation - optional but must be valid if provided
    if (formData.phone && !/^[0-9]{10,13}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Nomor HP harus 10-13 digit angka"
      isValid = false
    }

    // Birth date validation - optional but must be valid if provided
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate)
      const now = new Date()
      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = "Format tanggal lahir tidak valid"
        isValid = false
      } else if (birthDate > now) {
        newErrors.birthDate = "Tanggal lahir tidak boleh di masa depan"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Make actual API call to register
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address || null,
          phone: formData.phone || null,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()

      // We no longer need to handle profile image upload since the user will need to log in first
      // and upload the profile image after logging in

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.",
      })

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login?success=1")
      }, 1500)
    } catch (error) {
      toast({
        title: "Pendaftaran Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mendaftar. Silakan coba lagi nanti.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
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
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">
                  Password harus minimal 6 karakter.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">
                  Alamat
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Alamat lengkap"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? "border-red-500" : ""}
                  disabled={isLoading}
                  rows={3}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">
                  No HP
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate">
                  Tanggal Lahir
                </Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={errors.birthDate ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profileImage">
                  Foto Profil
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="profileImage"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectFile}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {profileImage ? 'Ganti Foto' : 'Pilih Foto'}
                  </Button>
                </div>
                {profileImage && (
                  <p className="text-xs text-muted-foreground">
                    File dipilih: {profileImage.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-4 text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login-user" className="font-medium text-primary underline-offset-4 hover:underline">
          Masuk di sini
        </Link>
      </div>
      <Toaster />
    </>
  )
}
