'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Upload,
  ArrowLeft
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface UserProfile {
  id: number
  memberId: string
  name: string
  email: string
  address: string | null
  phone: string | null
  birthDate: string | null
  profileImage: string | null
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

// Form schema untuk validasi data profil
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }).max(100, { message: "Nama maksimal 100 karakter" }),
  address: z.string().min(5, { message: "Alamat minimal 5 karakter" }).max(255, { message: "Alamat maksimal 255 karakter" }),
  phone: z.string().min(10, { message: "Nomor HP minimal 10 digit" }).max(13, { message: "Nomor HP maksimal 13 digit" })
    .regex(/^[0-9]{10,13}$/, { message: "Nomor HP harus berisi 10-13 digit angka" }),
  birthDate: z.string().min(1, { message: "Tanggal lahir wajib diisi" }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileEditPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now()) // Key untuk reset file input
  
  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      birthDate: "",
    },
    mode: "onChange" // Validasi saat input berubah
  })
  
  // Ambil data profil pengguna
  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("Fetching user profile...")
      const response = await fetch('/api/users/profile')
      
      if (!response.ok) {
        // Jika response 401, redirect ke login
        if (response.status === 401) {
          console.error("Authentication failed, redirecting to login")
          router.push('/login')
          return
        }
        
        const errorText = await response.text();
        console.error(`Error response: ${response.status}`, errorText);
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Profile data received:", data)
      
      if (!data || !data.name) {
        throw new Error('Invalid profile data received')
      }
      
      setProfile(data)
      
      // Set nilai form
      form.reset({
        name: data.name,
        address: data.address || "",
        phone: data.phone || "",
        birthDate: data.birthDate ? 
          format(new Date(data.birthDate), 'yyyy-MM-dd') : 
          "",
      })
      
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Gagal memuat data profil. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle session status
  useEffect(() => {
    console.log("Session status:", sessionStatus);
    
    if (sessionStatus === 'unauthenticated') {
      console.log("User is not authenticated, redirecting to login");
      router.push('/login');
    } else if (sessionStatus === 'authenticated') {
      console.log("User is authenticated, fetching profile");
      fetchProfile();
    }
  }, [sessionStatus, router]);
  
  // Handle perbarui profil
  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true)
    setError(null)
    
    try {
      // Validasi tambahan
      if (values.phone && !/^[0-9]{10,13}$/.test(values.phone.replace(/\D/g, ""))) {
        throw new Error("Nomor HP harus berisi 10-13 digit angka")
      }
      
      if (values.birthDate) {
        const birthDate = new Date(values.birthDate)
        if (isNaN(birthDate.getTime())) {
          throw new Error("Format tanggal lahir tidak valid")
        }
        if (birthDate > new Date()) {
          throw new Error("Tanggal lahir tidak boleh di masa depan")
        }
      }
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          address: values.address,
          phone: values.phone,
          birthDate: values.birthDate ? new Date(values.birthDate).toISOString() : null,
          redirectTo: '/profile', // Redirect ke halaman profil
        }),
      })
      
      // Handle respons error
      if (!response.ok) {
        // Jika response 401, redirect ke login
        if (response.status === 401) {
          console.error("Authentication failed during update, redirecting to login")
          router.push('/login')
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
      
      const data = await response.json()
      
      // Notifikasi sukses
      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Data profil Anda telah diperbarui dengan sukses.',
      })
      
      // Redirect ke halaman profil setelah update berhasil
      setTimeout(() => {
        router.push('/profile');
      }, 1000); // Delay 1 detik untuk memastikan toast muncul
      
    } catch (err) {
      console.error('Failed to update profile:', err)
      
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui profil',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.',
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  // Handle unggah foto profil
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Format file tidak didukung',
        description: 'Silakan unggah file gambar (JPEG, PNG, WebP).',
      })
      // Reset file input
      setFileInputKey(Date.now())
      return
    }
    
    // Validasi ukuran file (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Ukuran file terlalu besar',
        description: 'Ukuran file maksimal 2MB.',
      })
      // Reset file input
      setFileInputKey(Date.now())
      return
    }
    
    setUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/users/profile/image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        // Jika response 401, redirect ke login
        if (response.status === 401) {
          console.error("Authentication failed during image upload, redirecting to login")
          router.push('/login')
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
      
      const data = await response.json()
      
      // Perbarui profil dengan gambar baru
      setProfile(prev => prev ? {
        ...prev,
        profileImage: data.profileImage
      } : null)
      
      toast({
        title: 'Foto profil berhasil diperbarui',
        description: 'Foto profil Anda telah diperbarui dengan sukses.',
      })
    } catch (err) {
      console.error('Failed to upload profile image:', err)
      
      toast({
        variant: 'destructive',
        title: 'Gagal mengunggah foto profil',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.',
      })
    } finally {
      setUploading(false)
      setFileInputKey(Date.now()) // Reset file input
    }
  }
  
  // Loading state while checking session
  if (sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memeriksa status login...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (sessionStatus === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    );
  }
  
  // Loading state while fetching profile
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat data profil...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => {
            setLoading(true)
            setError(null)
            fetchProfile()
          }}>
            Coba Lagi
          </Button>
          <Button variant="outline" onClick={() => router.push('/profile')}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/profile" className="flex items-center text-sm text-gray-500 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Profil
        </Link>
      </div>
      
      <PageHeader 
        title="Edit Profil" 
        description="Perbarui informasi profil Anda" 
        showAddButton={false} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
              <CardDescription>
                Unggah foto profil berukuran maks. 2MB (JPEG, PNG, WebP)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-6 relative w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200">
                {profile?.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-300">
                      {profile?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="w-full">
                <input
                  type="file"
                  id="profileImage"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  key={fileInputKey}
                  disabled={uploading}
                />
                <label
                  htmlFor="profileImage"
                  className={`flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-md cursor-pointer 
                    ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Unggah Foto</span>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
              <CardDescription>
                Perbarui data profil lengkap Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama lengkap Anda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Input placeholder="Alamat lengkap Anda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor HP</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/profile')}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !form.formState.isDirty}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 