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
  Edit,
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
import { generateMemberCardHTML } from "@/lib/utils"
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

export default function ProfilePage() {
  const { data: session, status: sessionStatus, update: updateSession } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])
  const [profileImageRequired, setProfileImageRequired] = useState(false)
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now()) // Key untuk reset file input
  
  // Ensure proper typing for session status
  type SessionStatusType = 'loading' | 'authenticated' | 'unauthenticated';
  const currentStatus = sessionStatus as SessionStatusType;
  
  // Fungsi logout jika diperlukan
  const handleLogout = () => {
    console.log("Logging out and redirecting to login page...")
    router.push('/logout')
  }
  
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
      
      // Cek field yang belum lengkap termasuk foto profil
      const incomplete = []
      if (!data.address) incomplete.push('alamat')
      if (!data.phone) incomplete.push('nomor HP')
      if (!data.birthDate) incomplete.push('tanggal lahir')
      if (!data.profileImage) {
        incomplete.push('foto profil')
        setProfileImageRequired(true)
      } else {
        setProfileImageRequired(false)
      }
      setIncompleteFields(incomplete)
      
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Gagal memuat data profil. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }
  
  // Redirect ke login jika tidak terotentikasi
  useEffect(() => {
    console.log("Session status:", currentStatus);
    
    if (currentStatus === 'unauthenticated') {
      console.log("User is not authenticated, redirecting to login");
      router.push('/login');
    } else if (currentStatus === 'authenticated') {
      console.log("User is authenticated, fetching profile");
      fetchProfile();
    }
  }, [currentStatus, router, fetchProfile, toast]);
  
  // Show special loading state when session is still loading
  if (currentStatus === 'loading') {
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
  if (currentStatus === 'unauthenticated') {
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
  
  // Handle perbarui profil
  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true)
    setError(null)
    
    try {
      // Cek apakah foto profil diperlukan tapi belum diunggah
      if (profileImageRequired) {
        toast({
          variant: 'destructive',
          title: 'Foto Profil Wajib',
          description: 'Silakan unggah foto profil Anda sebelum menyimpan perubahan.',
        })
        setSubmitting(false)
        return
      }
      
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
          redirectTo: '/user/profile', // Redirect ke halaman profil user
        }),
      })
      
      // Handle respons error
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
      
      const data = await response.json()
      
      // Perbarui state lokal dengan data profil baru
      setProfile(data)
      
      // Perbarui status field yang belum lengkap
      const incomplete = []
      if (!data.address) incomplete.push('alamat')
      if (!data.phone) incomplete.push('nomor HP')
      if (!data.birthDate) incomplete.push('tanggal lahir')
      if (!data.profileImage) {
        incomplete.push('foto profil')
        setProfileImageRequired(true)
      } else {
        setProfileImageRequired(false)
      }
      setIncompleteFields(incomplete)
      
      // Notifikasi sukses
      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Data profil Anda telah diperbarui dengan sukses.',
      })
      
      // Reset state form
      form.reset({
        name: data.name,
        address: data.address || "",
        phone: data.phone || "",
        birthDate: data.birthDate ? 
          format(new Date(data.birthDate), 'yyyy-MM-dd') : 
          "",
      }, { keepValues: true }) // Keep values but reset dirty state
      
      // Update session untuk memperbarui data di seluruh aplikasi
      if (updateSession) {
        await updateSession({
          name: data.name,
          address: data.address,
          phone: data.phone,
          birthDate: data.birthDate,
          profileImage: data.profileImage,
        });
      }
      
      // Redirect ke halaman profil setelah update berhasil
      if (data.redirectUrl) {
        setTimeout(() => {
          router.push(data.redirectUrl);
        }, 1000); // Delay 1 detik untuk memastikan toast muncul
      }
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }
      
      const data = await response.json()
      
      // Perbarui profil dengan gambar baru
      setProfile(prev => prev ? {
        ...prev,
        profileImage: data.profileImage
      } : null)
      
      // Perbarui flag foto profil required
      setProfileImageRequired(false)
      
      // Perbarui field yang belum lengkap
      if (incompleteFields.includes('foto profil')) {
        setIncompleteFields(incompleteFields.filter(field => field !== 'foto profil'))
      }
      
      // Update session untuk memperbarui foto profil di seluruh aplikasi
      if (updateSession) {
        await updateSession({
          profileImage: data.profileImage
        });
      }
      
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
      
      // Reset file input
      setFileInputKey(Date.now())
    }
  }
  
  // Cetak kartu anggota ke PDF
  const handlePrintCard = () => {
    if (!profile) return;
    
    try {
      // Buat konten HTML untuk kartu anggota
      const htmlContent = generateMemberCardHTML(profile);
      
      // Buat blob dari HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Buka halaman baru untuk mencetak
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Setelah selesai mencetak, bebaskan URL
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
      } else {
        // Jika popup diblokir
        toast({
          variant: 'destructive',
          title: 'Popup diblokir',
          description: 'Izinkan popup untuk mencetak kartu anggota.',
        });
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to print card:', err);
      toast({
        variant: 'destructive',
        title: 'Gagal mencetak kartu',
        description: 'Terjadi kesalahan saat mencetak kartu anggota.',
      });
    }
  };
  
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data profil...</span>
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Profil Saya" 
        description="Informasi dan pengaturan akun"
        showAddButton={false}
        rightContent={
          <Button asChild>
            <Link href="/profile/edit">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </Link>
          </Button>
        }
      />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {incompleteFields.length > 0 && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Profil Belum Lengkap</AlertTitle>
          <AlertDescription className="text-amber-700">
            Lengkapi profil Anda dengan menambahkan {incompleteFields.join(', ')}.
            <div className="mt-3">
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
                  Lengkapi Profil
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Member ID Card */}
        <Card>
          <CardHeader>
            <CardTitle>Kartu Anggota</CardTitle>
            <CardDescription>
              Informasi keanggotaan perpustakaan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
              {profile?.profileImage ? (
                <Image 
                  src={profile.profileImage}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-4xl font-semibold text-muted-foreground">
                    {profile?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            
            <div className="w-full p-4 border rounded-lg bg-muted/30">
              <div className="text-center mb-2">
                <h3 className="font-semibold text-lg">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">ID Anggota:</span>
                  <span className="font-bold text-primary">{profile?.memberId}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-semibold ${
                    profile?.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profile?.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Terdaftar Sejak:</span>
                  <span>{profile?.createdAt && format(
                    new Date(profile.createdAt),
                    'd MMMM yyyy',
                    { locale: localeId }
                  )}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full flex flex-col gap-2">
              <Button
                variant={profileImageRequired ? "default" : "outline"}
                className="w-full"
                disabled={uploading}
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sedang Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {profile?.profileImage ? "Ganti Foto Profil" : "Unggah Foto Profil"}
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handlePrintCard}
                disabled={!profile || incompleteFields.length > 0}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Cetak Kartu Anggota
              </Button>
              <input
                id="image-upload"
                key={fileInputKey}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {profileImageRequired && (
                <p className="text-sm text-red-500 mt-1">
                  Foto profil wajib diunggah
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>
              Perbarui informasi profil Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Nama lengkap Anda" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted/50"
                      />
                    </FormControl>
                    <FormDescription>
                      Email tidak dapat diubah
                    </FormDescription>
                  </FormItem>
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Alamat lengkap Anda" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor HP <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nomor HP Anda" 
                            {...field} 
                            required 
                            type="tel"
                            pattern="[0-9]{10,13}"
                            inputMode="numeric"
                            onChange={(e) => {
                              // Hanya izinkan angka
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
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
                        <FormLabel>Tanggal Lahir <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            required 
                            max={new Date().toISOString().split('T')[0]} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              form="profile-form"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 