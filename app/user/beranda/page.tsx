"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Book, ClockIcon, BookMarked, CircleCheck, CircleX, PlusCircle } from "lucide-react"
import Link from "next/link"
import { DashboardLayout, DashboardSection, DashboardHeader, DashboardContent, DashboardGrid } from "@/components/dashboard/DashboardLayout"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { PopularBooks } from "@/components/dashboard/PopularBooks"
import RequestLoanDialog from "@/components/RequestLoanDialog"

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
  const [popularBooks, setPopularBooks] = useState<any[]>([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)

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
    <DashboardLayout>
      <DashboardSection>
        <DashboardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-primary-900 dark:text-primary-50">Beranda</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-primary-400">Selamat datang di Perpustakaan Digital</p>
        </DashboardHeader>
      </DashboardSection>
      <DashboardGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Katalog Buku */}
        <div
          onClick={() => handleCardClick("catalog")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat katalog buku"
        >
          <SummaryCard
            title="Katalog Buku"
            value={null}
            icon={Book}
            loading={isLoading}
            colorClass="text-accent-600 bg-accent-50 dark:bg-accent-950 dark:text-accent-400"
            description="Jelajahi koleksi buku perpustakaan digital kami."
          />
        </div>
        {/* Peminjaman Aktif */}
        <div
          onClick={() => handleCardClick("activeLoans")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-success-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat peminjaman aktif"
        >
          <SummaryCard
            title="Peminjaman Aktif"
            value={loanSummary.approved + loanSummary.pending}
            icon={BookMarked}
            loading={isLoading}
            colorClass="text-success-600 bg-success-50 dark:bg-success-950 dark:text-success-400"
            description="Kelola peminjaman buku yang sedang aktif."
          />
          {/* Aksi cepat di dalam kartu */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={e => { e.stopPropagation(); handleCardClick("approvedLoans") }}
              className="px-3 py-1 rounded bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Disetujui: {loanSummary.approved}
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleCardClick("pendingLoans") }}
              className="px-3 py-1 rounded bg-yellow-50 text-yellow-700 text-xs font-medium hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Menunggu: {loanSummary.pending}
            </button>
          </div>
        </div>
        {/* Riwayat Peminjaman */}
        <div
          onClick={() => handleCardClick("history")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat riwayat peminjaman"
        >
          <SummaryCard
            title="Riwayat Peminjaman"
            value={loanSummary.returned + loanSummary.rejected}
            icon={ClockIcon}
            loading={isLoading}
            colorClass="text-primary-600 bg-primary-50 dark:bg-primary-950 dark:text-primary-400"
            description="Lihat riwayat peminjaman buku Anda."
          />
          {/* Breakdown */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">Dikembalikan: {loanSummary.returned}</span>
            <span className="px-3 py-1 rounded bg-red-50 text-red-700 text-xs font-medium">Ditolak: {loanSummary.rejected}</span>
          </div>
        </div>
        {/* Pinjam Buku Baru (aksi cepat) */}
        <div
          onClick={() => handleCardClick("pinjamBaru")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-400 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Pinjam buku baru"
        >
          <SummaryCard
            title="Pinjam Buku Baru"
            value={null}
            icon={PlusCircle}
            loading={isLoading}
            colorClass="text-accent-700 bg-accent-100 dark:bg-accent-900 dark:text-accent-300"
            description="Ajukan peminjaman buku baru"
          />
        </div>
      </DashboardGrid>
      {/* Buku Populer */}
      <DashboardSection>
        <DashboardHeader>
          <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-50 text-center md:text-left">Buku Populer</h2>
        </DashboardHeader>
        <DashboardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <PopularBooks books={popularBooks} loading={loadingPopular} onBookClick={handlePopularBookClick} />
          </div>
        </DashboardContent>
      </DashboardSection>
      {/* Modal Pinjam Buku dari Buku Populer */}
      <RequestLoanDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        book={selectedBook}
      />
    </DashboardLayout>
  )
} 