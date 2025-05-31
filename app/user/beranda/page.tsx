"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Book, ClockIcon, BookMarked, CircleCheck, CircleX, PlusCircle, AlertCircle, ArrowRight, Heart, CheckCircle, Coins } from "lucide-react"
import Link from "next/link"
import { DashboardLayout, DashboardSection, DashboardHeader, DashboardContent, DashboardGrid } from "@/components/dashboard/DashboardLayout"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { PopularBooks } from "@/components/dashboard/PopularBooks"
import RequestLoanDialog from "@/components/RequestLoanDialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarDropdown } from "@/components/ui/AvatarDropdown"

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
  const [totalFine, setTotalFine] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [popularBooks, setPopularBooks] = useState<any[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [bookLoans, setBookLoans] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState(0)

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
        setBookLoans(loans)
        
        // Calculate total fine
        const fine = loans.reduce((total: number, loan: any) => {
          if (loan.status === 'LATE' && loan.actualReturnDate) {
            const returnDate = new Date(loan.returnDate)
            const actualReturnDate = new Date(loan.actualReturnDate)
            const diffInDays = Math.ceil(
              (actualReturnDate.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            return total + (diffInDays * 5000) // Rp 5.000 per hari
          }
          return total
        }, 0)
        setTotalFine(fine)

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

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setLoadingPopular(true)
        const res = await fetch('/api/books/popular')
        if (!res.ok) throw new Error('Failed to fetch popular books')
        const data = await res.json()
        setPopularBooks(data)
      } catch (err) {
        setPopularBooks([])
      } finally {
        setLoadingPopular(false)
      }
    }
    fetchPopularBooks()
  }, [])

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist')
        if (!response.ok) throw new Error('Failed to fetch wishlist')
        const data = await response.json()
        setWishlistCount(Array.isArray(data) ? data.length : 0)
      } catch (error) {
        setWishlistCount(0)
      }
    }
    if (session?.user?.id) {
      fetchWishlist()
    }
  }, [session])

  const handleCardClick = (type: string) => {
    switch (type) {
      case "catalog":
        router.push("/user/katalog")
        break
      case "activeLoans":
        router.push("/user/active-loans")
        break
      case "history":
        router.push("/user/history")
        break
      case "pinjamBaru":
        router.push("/user/katalog")
        break
      case "approvedLoans":
        router.push("/user/active-loans?tab=APPROVED")
        break
      case "pendingLoans":
        router.push("/user/active-loans?tab=PENDING")
        break
    }
  }

  const handlePopularBookClick = (book: any) => {
    setSelectedBook(book)
    setIsRequestDialogOpen(true)
  }

  return (
    <>
      {/* HEADER PERSONAL */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-900 mb-2">Selamat Datang{session?.user?.name ? `, ${session.user.name}!` : '!'}</h1>
          <p className="text-lg md:text-xl text-gray-500 font-light">Overview aktivitas perpustakaan Anda</p>
        </div>
        <div className="hidden md:block">
          <AvatarDropdown />
        </div>
      </div>
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 w-full items-stretch">
        {/* Borrowed Books Card */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start gap-4 transition-transform transition-shadow duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl"
          onClick={() => router.push('/user/active-loans?tab=APPROVED')}
          tabIndex={0}
          role="button"
          aria-label="See all borrowed books"
        >
          <div className="bg-blue-100 text-blue-600 rounded-xl p-3 mb-2">
            <Book className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold">{loanSummary.approved}</div>
          <div className="text-lg font-medium text-gray-700">Borrowed Books</div>
        </div>
        {/* Wishlist Card */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start gap-4 transition-transform transition-shadow duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl"
          onClick={() => router.push('/user/wishlist')}
          tabIndex={0}
          role="button"
          aria-label="See wishlist"
        >
          <div className="bg-pink-100 text-pink-600 rounded-xl p-3 mb-2">
            <Heart className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold">{wishlistCount}</div>
          <div className="text-lg font-medium text-gray-700">Wishlist</div>
        </div>
        {/* Books Read Card */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start gap-4 transition-transform transition-shadow duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl"
          onClick={() => router.push('/user/history')}
          tabIndex={0}
          role="button"
          aria-label="See books read"
        >
          <div className="bg-green-100 text-green-600 rounded-xl p-3 mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold">{loanSummary.returned}</div>
          <div className="text-lg font-medium text-gray-700">Books Read</div>
        </div>
        {/* Fine Card */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-start gap-4 transition-transform transition-shadow duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl"
          onClick={() => router.push('/user/history')}
          tabIndex={0}
          role="button"
          aria-label="See fine details"
        >
          <div className="bg-yellow-100 text-yellow-600 rounded-xl p-3 mb-2">
            <Coins className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold">{totalFine > 0 ? `Rp ${totalFine.toLocaleString()}` : 'Rp 0'}</div>
          <div className="text-lg font-medium text-gray-700">Fine</div>
        </div>
      </div>
      {/* PEMINJAMAN AKTIF */}
      <div className="mb-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-900">Peminjaman Aktif</h2>
          <Link href="/user/active-loans" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">Lihat Semua <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full items-stretch">
          {bookLoans.filter((loan: any) => ['APPROVED', 'PENDING', 'LATE'].includes(loan.status)).slice(0, 3).map((loan: any) => (
            <div key={loan.id} className="bg-white rounded-2xl shadow-lg p-6 flex gap-4 items-center">
              <div className="flex-shrink-0">
                <img src={loan.book.coverImage || '/book-placeholder.png'} alt={loan.book.title} className="w-24 h-32 object-cover rounded-xl shadow" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {loan.status === 'LATE' && <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold rounded px-2 py-0.5">Terlambat</span>}
                  {loan.status === 'PENDING' && <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold rounded px-2 py-0.5">Menunggu</span>}
                  {loan.status === 'APPROVED' && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold rounded px-2 py-0.5">Disetujui</span>}
                </div>
                <div className="font-bold text-lg md:text-xl text-primary-900 line-clamp-2">{loan.book.title}</div>
                <div className="text-base md:text-lg text-gray-500 mb-1 line-clamp-1">{loan.book.author}</div>
                <div className="flex flex-col gap-1 text-base text-gray-500 mt-1">
                  <span className="inline-flex items-center gap-1"><ClockIcon className="w-5 h-5" />Jatuh tempo: {new Date(loan.returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {loan.status === 'LATE' && <span className="inline-flex items-center gap-1 text-red-600 font-medium"><AlertCircle className="w-5 h-5" />Denda: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.ceil((new Date().getTime() - new Date(loan.returnDate).getTime()) / (1000 * 60 * 60 * 24)) * 5000)}</span>}
                </div>
              </div>
            </div>
          ))}
          {bookLoans.filter((loan: any) => ['APPROVED', 'PENDING', 'LATE'].includes(loan.status)).length === 0 && (
            <div className="text-gray-500 italic col-span-full">Tidak ada peminjaman aktif.</div>
          )}
        </div>
      </div>
      {/* RIWAYAT TERAKHIR */}
      <div className="mb-10 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-900">Riwayat Terakhir</h2>
          <Link href="/user/history" className="text-primary-600 font-medium hover:underline">Lihat Semua</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">BUKU</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">TANGGAL PINJAM</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">TANGGAL KEMBALI</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">STATUS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {bookLoans.filter((loan: any) => ['RETURNED', 'REJECTED'].includes(loan.status)).slice(0, 2).map((loan: any) => (
                <tr key={loan.id}>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-center">
                      <img src={loan.book.coverImage || '/book-placeholder.png'} alt={loan.book.title} className="object-cover rounded-lg shadow w-20 h-28 mb-2" />
                      <div className="mt-2 text-center">
                        <div className="font-semibold text-lg md:text-xl text-primary-900 line-clamp-1">{loan.book.title}</div>
                        <div className="text-base md:text-lg text-gray-500 line-clamp-1">{loan.book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(loan.borrowDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(loan.returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    {loan.status === 'RETURNED' && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold rounded px-2 py-0.5">Dikembalikan</span>}
                    {loan.status === 'REJECTED' && <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold rounded px-2 py-0.5">Ditolak</span>}
                  </td>
                </tr>
              ))}
              {bookLoans.filter((loan: any) => ['RETURNED', 'REJECTED'].includes(loan.status)).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-gray-500 italic px-4 py-3 text-center">Belum ada riwayat peminjaman.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Buku Populer */}
      <DashboardSection>
        <DashboardHeader className="text-center md:text-center lg:text-center">
          <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-50">Buku Populer</h2>
        </DashboardHeader>
        <DashboardContent>
          <PopularBooks books={popularBooks} loading={loadingPopular} />
        </DashboardContent>
      </DashboardSection>
      {/* Modal Pinjam Buku dari Buku Populer */}
      <RequestLoanDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        book={selectedBook}
      />
    </>
  )
} 