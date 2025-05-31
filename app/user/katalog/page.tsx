"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, ImageIcon, CalendarIcon, Check, Loader2, AlertCircle, Book as BookIcon, BookOpen as BookOpenIcon, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"
import { id } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import RequestLoanDialog from "@/components/RequestLoanDialog"
import { WishlistButton } from "@/components/wishlist-button"
import Image from "next/image"
import { DashboardSection, DashboardHeader } from "@/components/dashboard/DashboardLayout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { BookCard, type Book } from "@/components/book-card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"
import { motion } from "framer-motion"

// Active loan type
type ActiveLoan = {
  bookId: number;
  status: string;
};

export default function KatalogPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([])
  const [wishlistBookIds, setWishlistBookIds] = useState<number[]>([])
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Extract unique categories and years for filters
  const categories = [...new Set(books.map(book => book.category))].filter(Boolean)
  const years = [...new Set(books.map(book => book.year))]
    .filter((y): y is number => typeof y === 'number')
    .sort((a: number, b: number) => b - a)

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/books')
        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }
        const data = await response.json()
        setBooks(data)
        setFilteredBooks(data)
      } catch (error) {
        console.error('Error fetching books:', error)
        toast.error('Gagal memuat data buku')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // Fetch user's active loans
  useEffect(() => {
    const fetchActiveLoans = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch(`/api/bookloans?userId=${session.user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch active loans')
        }
        
        const loans = await response.json()
        
        // Extract active loans (PENDING or APPROVED)
        const active = loans
          .filter((loan: any) => loan.status === 'PENDING' || loan.status === 'APPROVED')
          .map((loan: any) => ({
            bookId: loan.bookId,
            status: loan.status
          }))
        
        setActiveLoans(active)
      } catch (error) {
        console.error('Error fetching active loans:', error)
      }
    }

    fetchActiveLoans()
  }, [session])

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user) return
      try {
        const response = await fetch('/api/wishlist')
        if (!response.ok) return
        const data = await response.json()
        // data: [{ id, title, author, coverUrl, bookId? }]
        // But our API returns id (wishlist id), so we need to map bookId
        // If not available, match by title/author (fallback)
        // But better: update API to return bookId, or here try to match by title
        // For now, try to get bookId from books
        const ids = data.map((item: any) => {
          if (item.bookId) return item.bookId
          // fallback: match by title
          const found = books.find(b => b.title === item.title && b.author === item.author)
          return found?.id
        }).filter(Boolean)
        setWishlistBookIds(ids)
      } catch (error) {
        // ignore
      }
    }
    fetchWishlist()
  }, [session, books])

  // Filter and sort books
  useEffect(() => {
    let result = [...books]

    // Apply search query
    if (searchQuery) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(book => book.category === categoryFilter)
    }

    // Apply year filter
    if (yearFilter !== "all") {
      result = result.filter(book => book.year === parseInt(yearFilter))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(book => {
        if (statusFilter === "available") return book.stock > 0
        if (statusFilter === "borrowed") return book.stock === 0
        return true
      })
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a: Book, b: Book) => {
          const yearA = a.year ?? 0
          const yearB = b.year ?? 0
          return yearB - yearA
        })
        break
      case "oldest":
        result.sort((a: Book, b: Book) => {
          const yearA = a.year ?? 0
          const yearB = b.year ?? 0
          return yearA - yearB
        })
        break
      case "az":
        result.sort((a: Book, b: Book) => a.title.localeCompare(b.title))
        break
      case "za":
        result.sort((a: Book, b: Book) => b.title.localeCompare(a.title))
        break
      case "popular":
        result.sort((a: Book, b: Book) => {
          const countA = a.borrowCount ?? 0
          const countB = b.borrowCount ?? 0
          return countB - countA
        })
        break
    }

    setFilteredBooks(result)
  }, [books, searchQuery, categoryFilter, yearFilter, statusFilter, sortBy])

  const resetFilters = () => {
    setCategoryFilter("all")
    setYearFilter("all")
    setStatusFilter("all")
    setSortBy("newest")
    setSearchQuery("")
  }

  // Check if book is already borrowed
  const isBookAlreadyBorrowed = (bookId: number) => {
    return activeLoans.some(loan => loan.bookId === bookId)
  }

  // Handle book loan request
  const handleRequestLoan = (book: Book) => {
    // Check if user has already borrowed this book
    if (isBookAlreadyBorrowed(book.id)) {
      toast.error('Kamu sudah meminjam buku ini dan belum mengembalikannya.')
      return
    }
    
    setSelectedBook(book)
    setIsRequestDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-5xl mx-auto mb-8">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-3xl font-bold">Katalog Buku</CardTitle>
          <CardDescription className="text-base text-gray-700 dark:text-gray-200 font-semibold mt-2">
            Temukan dan ajukan peminjaman buku perpustakaan digital
          </CardDescription>
        </CardHeader>
      </Card>
      {/* Search, Sort, and Filter Bar */}
      <div className="mb-8 space-y-4">
        {/* Mobile: Centered controls */}
        <div className="flex flex-col gap-4 md:hidden items-center justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari judul atau penulis..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full max-w-md text-center">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
              <SelectItem value="popular">Terpopuler</SelectItem>
            </SelectContent>
          </Select>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full max-w-md">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Buku</SheetTitle>
                <SheetDescription>
                  Sesuaikan filter untuk menemukan buku yang Anda inginkan
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                <div className="space-y-6 py-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category ?? ''} value={category ?? ''}>
                            {category ?? 'Tanpa Kategori'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-2">
                    <Label>Tahun Terbit</Label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tahun</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year?.toString() ?? ''} value={year?.toString() ?? ''}>
                            {year ?? 'Tahun Tidak Diketahui'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="available">Tersedia</SelectItem>
                        <SelectItem value="borrowed">Sudah Dipinjam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
        {/* Desktop: original controls */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari judul atau penulis..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
              <SelectItem value="popular">Terpopuler</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category ?? ''} value={category ?? ''}>
                    {category ?? 'Tanpa Kategori'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tahun Terbit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year?.toString() ?? ''} value={year?.toString() ?? ''}>
                    {year ?? 'Tahun Tidak Diketahui'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="available">Tersedia</SelectItem>
                <SelectItem value="borrowed">Sudah Dipinjam</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-[2/3] w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="px-4 pb-2">
                <Skeleton className="h-3 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </CardContent>
              <CardFooter className="p-4">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onRequestLoan={handleRequestLoan}
              isWishlisted={wishlistBookIds.includes(book.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Tidak ada buku yang ditemukan</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Coba ubah filter pencarian atau reset filter untuk melihat semua buku.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filter
          </Button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Perpustakaan Digital. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="/kontak" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kontak
              </a>
              <a href="/bantuan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bantuan
              </a>
              <a href="/tentang" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tentang Kami
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Request Loan Dialog */}
      <RequestLoanDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        book={selectedBook}
        onSuccess={() => {
          toast.success(
            <div className="flex items-center gap-3">
              <Check className="w-7 h-7 text-green-600" />
              <span className="font-semibold">Successfully Submitted Loan</span>
            </div>,
            { duration: 3000 }
          )
          if (session?.user?.id) {
            const fetchActiveLoans = async () => {
              try {
                const response = await fetch(`/api/bookloans?userId=${session.user.id}`)
                if (!response.ok) {
                  throw new Error('Failed to fetch active loans')
                }
                const loans = await response.json()
                const active = loans
                  .filter((loan: any) => loan.status === 'PENDING' || loan.status === 'APPROVED')
                  .map((loan: any) => ({
                    bookId: loan.bookId,
                    status: loan.status
                  }))
                setActiveLoans(active)
              } catch (error) {
                console.error('Error fetching active loans after success:', error)
              }
            }
            fetchActiveLoans()
          }
        }}
      />
    </div>
  )
} 