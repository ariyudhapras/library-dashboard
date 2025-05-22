"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Book, ClockIcon, BookMarked, CircleCheck, CircleX, PlusCircle } from "lucide-react"
import Link from "next/link"

// Book loan summary type
type LoanSummary = {
  total: number
  pending: number
  approved: number
  rejected: number
  returned: number
  late: number
}

export default function BerandaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loanSummary, setLoanSummary] = useState<LoanSummary>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    returned: 0,
    late: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLoanSummary = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/bookloans?userId=${session.user.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch book loans')
        }
        
        const loans = await response.json()
        
        // Calculate summary
        const summary = {
          total: loans.length,
          pending: loans.filter((loan: any) => loan.status === 'PENDING').length,
          approved: loans.filter((loan: any) => loan.status === 'APPROVED').length,
          rejected: loans.filter((loan: any) => loan.status === 'REJECTED').length,
          returned: loans.filter((loan: any) => loan.status === 'RETURNED').length,
          late: loans.filter((loan: any) => loan.status === 'LATE').length
        }
        
        setLoanSummary(summary)
      } catch (error) {
        console.error('Error fetching loan summary:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchLoanSummary()
    }
  }, [session])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Beranda" 
        description="Selamat datang di Perpustakaan Digital" 
        showAddButton={false} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/user/katalog" className="group">
          <div className="bg-white p-6 rounded-md shadow-sm border hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="mb-4 bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center text-blue-600">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2 group-hover:text-blue-600">Katalog Buku</h3>
            <p className="text-gray-500 mb-4">Jelajahi koleksi buku perpustakaan digital kami.</p>
          </div>
        </Link>
        
        <Link href="/user/active-loans" className="group">
          <div className="bg-white p-6 rounded-md shadow-sm border hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="mb-4 bg-green-50 rounded-full w-12 h-12 flex items-center justify-center text-green-600">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2 group-hover:text-blue-600">Peminjaman Aktif</h3>
            <p className="text-gray-500 mb-4">Kelola peminjaman buku yang sedang aktif.</p>
            {!isLoading && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-yellow-50 p-3 rounded-md flex flex-col items-center">
                  <span className="text-yellow-700 font-bold text-xl">{loanSummary.pending}</span>
                  <span className="text-yellow-600 text-xs">Menunggu</span>
                </div>
                <div className="bg-green-50 p-3 rounded-md flex flex-col items-center">
                  <span className="text-green-700 font-bold text-xl">{loanSummary.approved}</span>
                  <span className="text-green-600 text-xs">Disetujui</span>
                </div>
              </div>
            )}
          </div>
        </Link>
        
        <div className="bg-white p-6 rounded-md shadow-sm border">
          <div className="mb-4 bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center text-purple-600">
            <ClockIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">Riwayat Peminjaman</h3>
          <p className="text-gray-500 mb-4">Lihat riwayat peminjaman buku Anda.</p>
          {!isLoading && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-blue-50 p-3 rounded-md flex flex-col items-center">
                <span className="text-blue-700 font-bold text-xl">{loanSummary.returned}</span>
                <span className="text-blue-600 text-xs">Dikembalikan</span>
              </div>
              <div className="bg-red-50 p-3 rounded-md flex flex-col items-center">
                <span className="text-red-700 font-bold text-xl">{loanSummary.rejected}</span>
                <span className="text-red-600 text-xs">Ditolak</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/user/katalog">
            <div className="flex items-center p-4 bg-white border rounded-md hover:shadow-md transition-all">
              <PlusCircle className="h-5 w-5 mr-3 text-blue-600" />
              <span>Pinjam Buku Baru</span>
            </div>
          </Link>
          <Link href="/user/active-loans?tab=APPROVED">
            <div className="flex items-center p-4 bg-white border rounded-md hover:shadow-md transition-all">
              <CircleCheck className="h-5 w-5 mr-3 text-green-600" />
              <span>Lihat Peminjaman Disetujui</span>
            </div>
          </Link>
          <Link href="/user/active-loans?tab=PENDING">
            <div className="flex items-center p-4 bg-white border rounded-md hover:shadow-md transition-all">
              <CircleX className="h-5 w-5 mr-3 text-orange-600" />
              <span>Lihat Permintaan Tertunda</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 