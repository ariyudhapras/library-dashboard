"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Edit, Printer, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { generateMemberCardHTML } from "@/lib/utils"
import { useRouter } from "next/navigation"

type UserProfile = {
  name: string
  email: string
  role: string
  memberId: string
  profileImage?: string
  address?: string
  phone?: string
  birthDate?: string
  createdAt: string
  status?: string
}

export default function UserProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const router = useRouter()
  
  const fetchProfile = useCallback(async () => {
    if (status !== 'authenticated') {
      console.log("Skip fetching profile: not authenticated")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setDebugInfo('Fetching profile data...')
      console.log("Fetching profile data...")
      
      const response = await fetch('/api/users/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        const errorInfo = `Error response: ${response.status} - ${errorText}`
        console.error(errorInfo)
        setDebugInfo(errorInfo)
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Profile data received:", data)
      setDebugInfo('Profile data received successfully')
      
      if (!data || !data.name) {
        throw new Error('Invalid profile data received - missing fields')
      }
      
      setProfile(data)
      
      const incomplete = []
      if (!data.address) incomplete.push('alamat')
      if (!data.phone) incomplete.push('nomor telepon')
      if (!data.birthDate) incomplete.push('tanggal lahir')
      if (!data.profileImage) incomplete.push('foto profil')
      
      setIncompleteFields(incomplete)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error fetching profile:', error)
      setError(`Gagal memuat data profil: ${errorMessage}`)
      setDebugInfo(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    console.log("Session status changed:", status)
    setDebugInfo(`Session status: ${status}`)
    
    if (status === 'authenticated') {
      console.log("User is authenticated, fetching profile")
      setDebugInfo(`User authenticated as ${session?.user?.email}, fetching profile...`)
      fetchProfile()
    } else if (status === 'unauthenticated') {
      console.log("User is not authenticated, redirecting to login")
      setDebugInfo('User not authenticated, redirecting to login...')
      router.push('/login')
    }
  }, [status, fetchProfile, router, session])
  
  const handlePrintCard = () => {
    if (!profile) return;
    
    try {
      const htmlContent = generateMemberCardHTML(profile);
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
      } else {
        console.error('Popup diblokir. Izinkan popup untuk mencetak kartu anggota.');
      }
    } catch (err) {
      console.error('Failed to print card:', err);
    }
  };
  
  const handleShowQR = () => {
    if (!profile?.memberId) return;
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${profile.memberId}`;
    window.open(qrUrl, '_blank');
  };
  
  const qrCodeUrl = profile?.memberId ? 
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.memberId}` : 
    null
  
  // Fungsi untuk mencoba refresh session jika terjadi masalah
  const refreshSession = () => {
    console.log("Attempting to refresh session...")
    setLoading(true)
    setError(null)
    setDebugInfo('Refreshing session...')
    
    // Tunggu sebentar lalu coba fetch lagi
    setTimeout(() => {
      fetchProfile()
    }, 1000)
  }
  
  // Fungsi untuk logout jika semua upaya gagal
  const handleLogout = () => {
    console.log("Logging out and redirecting to login page...")
    signOut({ callbackUrl: '/login' })
  }
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memeriksa status login...</p>
          <p className="text-xs text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    router.push('/login')
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Mengarahkan ke halaman login...</p>
          <p className="text-xs text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Memuat data profil...</p>
          <p className="text-xs text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-xs text-gray-500 mb-4">{debugInfo}</div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setLoading(true)
            setError(null)
            fetchProfile()
          }}>
            Coba Lagi
          </Button>
          <Button variant="outline" onClick={refreshSession}>
            Refresh Session
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="container py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Data profil tidak ditemukan. Silahkan coba lagi.</AlertDescription>
        </Alert>
        <div className="text-xs text-gray-500 mb-4">{debugInfo}</div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setLoading(true)
            fetchProfile()
          }}>
            Coba Lagi
          </Button>
          <Button variant="outline" onClick={refreshSession}>
            Refresh Session
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Profil Saya" 
        description="Informasi dan pengaturan akun" 
        showAddButton={false} 
        rightContent={
          <Link href="/user/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </Button>
          </Link>
        }
      />
      
      {incompleteFields.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Profil Belum Lengkap</AlertTitle>
          <AlertDescription className="text-amber-700">
            Mohon lengkapi profil Anda dengan menambahkan {incompleteFields.join(', ')}.
            <div className="mt-2">
              <Link href="/user/profile/edit">
                <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
                  Lengkapi Profil
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Kartu Anggota Digital</CardTitle>
          <CardDescription>
            ID Anggota: <span className="font-medium">{profile?.memberId}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="membership-card flex flex-col md:flex-row gap-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 flex items-center justify-center">
              {profile?.profileImage ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                  <Image 
                    src={profile.profileImage}
                    alt={profile?.name || "Profile"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-primary">
                  <span className="text-4xl font-bold text-gray-500">
                    {profile?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-grow space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h3 className="text-xl font-bold text-gray-800">{profile?.name}</h3>
                <div className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {profile?.memberId}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{profile?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                  <p className="text-gray-700">
                    {profile?.createdAt ? format(new Date(profile.createdAt), 'd MMMM yyyy', { locale: localeId }) : "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="text-gray-700">{profile?.address || "-"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">No. Telepon</p>
                  <p className="text-gray-700">{profile?.phone || "-"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Tanggal Lahir</p>
                  <p className="text-gray-700">
                    {profile?.birthDate ? format(new Date(profile.birthDate), 'd MMMM yyyy', { locale: localeId }) : "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-gray-700 capitalize">{profile?.role || "user"}</p>
                </div>
              </div>
            </div>
            
            {qrCodeUrl && (
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 bg-white p-1 rounded-md border border-gray-200">
                  <Image 
                    src={qrCodeUrl}
                    alt="QR Code"
                    width={90}
                    height={90}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs text-gray-500">Scan untuk verifikasi</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintCard}
            disabled={incompleteFields.length > 0}
          >
            <Printer className="h-4 w-4 mr-2" />
            Cetak Kartu
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShowQR}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Tampilkan QR
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 