"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { id } from "date-fns/locale"
import { Search, Filter, BookOpen, CalendarIcon, ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Loader2, Check } from "lucide-react"

import type { Day } from "date-fns"

interface Book {
  id: number
  title: string
  author: string
  year: number
  stock: number
  category: string
  coverImage: string | null
  description: string
}

interface LoanFormData {
  borrowDate: Date | undefined
  returnDate: Date | undefined
  notes: string
}

// Sample book data
const booksData: Book[] = [
  {
    id: 1,
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    year: 2005,
    stock: 15,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel tentang perjuangan anak-anak di Belitung untuk mendapatkan pendidikan yang layak.",
  },
  {
    id: 2,
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    year: 1980,
    stock: 8,
    category: "Novel Sejarah",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel sejarah yang mengisahkan perjuangan seorang pribumi terpelajar pada masa kolonial Belanda.",
  },
  {
    id: 3,
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    year: 2018,
    stock: 20,
    category: "Filsafat",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Buku tentang filsafat Stoisisme yang diaplikasikan dalam kehidupan modern.",
  },
  {
    id: 4,
    title: "Pulang",
    author: "Tere Liye",
    year: 2015,
    stock: 12,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel yang mengisahkan perjalanan hidup seorang anak yang terpaksa menjadi pembunuh bayaran.",
  },
  {
    id: 5,
    title: "Perahu Kertas",
    author: "Dee Lestari",
    year: 2009,
    stock: 10,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel tentang kisah cinta dan persahabatan antara Kugy dan Keenan.",
  },
  {
    id: 6,
    title: "Negeri 5 Menara",
    author: "Ahmad Fuadi",
    year: 2009,
    stock: 14,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel inspiratif tentang kehidupan di pesantren dan mimpi untuk menggapai dunia.",
  },
  {
    id: 7,
    title: "Sang Pemimpi",
    author: "Andrea Hirata",
    year: 2006,
    stock: 9,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Sekuel dari Laskar Pelangi yang mengisahkan perjuangan Ikal dan Arai untuk menggapai mimpi.",
  },
  {
    id: 8,
    title: "Ayat-Ayat Cinta",
    author: "Habiburrahman El Shirazy",
    year: 2004,
    stock: 7,
    category: "Novel Islami",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel islami yang mengisahkan kehidupan cinta seorang mahasiswa Indonesia di Mesir.",
  },
  {
    id: 9,
    title: "Dilan: Dia adalah Dilanku Tahun 1990",
    author: "Pidi Baiq",
    year: 2014,
    stock: 18,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel tentang kisah cinta remaja SMA di Bandung pada tahun 1990.",
  },
  {
    id: 10,
    title: "Hujan",
    author: "Tere Liye",
    year: 2016,
    stock: 11,
    category: "Novel",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Novel fiksi ilmiah yang mengisahkan tentang persahabatan dan cinta di masa depan.",
  },
  {
    id: 11,
    title: "Rentang Kisah",
    author: "Gita Savitri Devi",
    year: 2017,
    stock: 15,
    category: "Memoar",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Memoar tentang perjalanan hidup Gita Savitri Devi selama menempuh pendidikan di Jerman.",
  },
  {
    id: 12,
    title: "Sebuah Seni untuk Bersikap Bodo Amat",
    author: "Mark Manson",
    year: 2016,
    stock: 13,
    category: "Pengembangan Diri",
    coverImage: "/placeholder.svg?height=250&width=180",
    description: "Buku pengembangan diri yang mengajarkan cara memilih hal-hal yang penting dalam hidup.",
  },
]

// Extract unique categories, authors, and years for filters
const categories = [...new Set(booksData.map((book) => book.category))]
const authors = [...new Set(booksData.map((book) => book.author))]
const years = [...new Set(booksData.map((book) => book.year))].sort((a, b) => b - a)

// Active loan type
type ActiveLoan = {
  bookId: number
  status: string
}

// Tambahkan komponen RequestLoanDialog yang sudah reusable
import RequestLoanDialog from "@/components/RequestLoanDialog"

export default function BookCatalog() {
  const { data: session } = useSession()
  const [books, setBooks] = useState<Book[]>(booksData)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loanForm, setLoanForm] = useState<LoanFormData>({
    borrowDate: undefined,
    returnDate: undefined,
    notes: "",
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
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

    if (session?.user?.id) {
      fetchActiveLoans()
    }
  }, [session])

  // Filter books based on search query and filters
  useEffect(() => {
    let filteredBooks = booksData

    // Apply search query
    if (searchQuery) {
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      filteredBooks = filteredBooks.filter((book) => book.category === categoryFilter)
    }

    // Apply author filter
    if (authorFilter && authorFilter !== "all") {
      filteredBooks = filteredBooks.filter((book) => book.author === authorFilter)
    }

    // Apply year filter
    if (yearFilter && yearFilter !== "all") {
      filteredBooks = filteredBooks.filter((book) => book.year === Number.parseInt(yearFilter))
    }

    setBooks(filteredBooks)
  }, [searchQuery, categoryFilter, authorFilter, yearFilter])

  // Check if book is already borrowed
  const isBookAlreadyBorrowed = (bookId: number) => {
    return activeLoans.some(loan => loan.bookId === bookId)
  }

  const handleRequestLoan = (book: Book) => {
    // Check if user has already borrowed this book
    if (isBookAlreadyBorrowed(book.id)) {
      toast.error('Kamu sudah meminjam buku ini dan belum mengembalikannya.')
      return
    }

    setSelectedBook(book)
    setLoanForm({
      borrowDate: undefined,
      returnDate: undefined,
      notes: "",
    })
    setIsRequestDialogOpen(true)
  }

  const confirmRequestLoan = async () => {
    if (!selectedBook || !loanForm.borrowDate || !loanForm.returnDate) {
      toast.error('Pilih tanggal peminjaman dan pengembalian')
      return
    }

    // Double check if user has already borrowed this book
    if (isBookAlreadyBorrowed(selectedBook.id)) {
      toast.error('Kamu sudah meminjam buku ini dan belum mengembalikannya.')
      setIsRequestDialogOpen(false)
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/bookloans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: selectedBook.id,
          borrowDate: loanForm.borrowDate.toISOString(),
          returnDate: loanForm.returnDate.toISOString(),
          notes: loanForm.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengajukan peminjaman')
      }

      // Update local active loans
      setActiveLoans([...activeLoans, { bookId: selectedBook.id, status: 'PENDING' }])
      
      toast.success('Pengajuan peminjaman berhasil dikirim')
      setIsRequestDialogOpen(false)
    } catch (error) {
      console.error('Error submitting loan request:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengajukan peminjaman')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setAuthorFilter("all")
    setYearFilter("all")
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setLoanForm({
        ...loanForm,
        borrowDate: date,
        returnDate: addDays(date, 7),
      })
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Katalog Buku</h1>
        <p className="text-muted-foreground">Temukan dan ajukan peminjaman buku perpustakaan digital</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari judul atau penulis..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={authorFilter} onValueChange={setAuthorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Penulis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Penulis</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun Terbit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Reset Filter
          </Button>
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
      ) : books.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onRequestLoan={handleRequestLoan} />
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
    </div>
  )
}

interface BookCardProps {
  book: Book
  onRequestLoan: (book: Book) => void
}

function BookCard({ book, onRequestLoan }: BookCardProps) {
  const { data: session } = useSession()
  const [isAlreadyBorrowed, setIsAlreadyBorrowed] = useState(false)
  
  useEffect(() => {
    const checkIfBorrowed = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch(`/api/bookloans?userId=${session.user.id}`)
        if (!response.ok) return
        
        const loans = await response.json()
        
        // Check if any active loan exists for this book
        const borrowed = loans.some((loan: any) => 
          loan.bookId === book.id && 
          (loan.status === 'PENDING' || loan.status === 'APPROVED')
        )
        
        setIsAlreadyBorrowed(borrowed)
      } catch (error) {
        console.error('Error checking book status:', error)
      }
    }
    
    if (session?.user?.id) {
      checkIfBorrowed()
    }
  }, [book.id, session])
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-slate-100">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {book.category}
          </Badge>
          <Badge variant="outline">{book.year}</Badge>
        </div>
        <p className="mt-2 text-sm">
          <span className="font-medium">Stok:</span> {book.stock}
        </p>
      </CardContent>
      <CardFooter className="p-4">
        {isAlreadyBorrowed ? (
          <Button className="w-full" variant="outline" disabled>
            <AlertCircle className="h-4 w-4 mr-2" />
            Sudah Dipinjam
          </Button>
        ) : (
          <Button onClick={() => onRequestLoan(book)} className="w-full" disabled={book.stock === 0}>
            {book.stock > 0 ? "Ajukan Pinjam" : "Stok Habis"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
