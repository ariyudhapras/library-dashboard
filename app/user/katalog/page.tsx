"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, ImageIcon, CalendarIcon, Check, Loader2, AlertCircle, Book as BookIcon, BookOpen as BookOpenIcon } from "lucide-react"
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
import RequestLoanDialog, { type Book } from "@/components/RequestLoanDialog"

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

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.publisher && book.publisher.toLowerCase().includes(query)) ||
      (book.isbn && book.isbn.toLowerCase().includes(query))
    )
    setFilteredBooks(filtered)
  }, [searchQuery, books])

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
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Katalog Buku" 
        description="Jelajahi koleksi buku perpustakaan digital" 
        showAddButton={false}
      />

      {/* Search Box */}
      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Cari judul atau penulis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Memuat data...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p>Tidak ada buku yang ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden flex flex-col h-full">
              {/* Book Cover Image */}
              <div className="aspect-[2/3] bg-muted/30 flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={`Sampul ${book.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/60" />
                    <p className="text-xs text-muted-foreground mt-2">Tidak ada sampul</p>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{book.title}</CardTitle>
                <CardDescription className="truncate">Karya: {book.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookIcon className="h-4 w-4 opacity-70" />
                    <span>Penerbit: {book.publisher || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4 opacity-70" />
                    <span>Tahun: {book.year || '-'}</span>
                  </div>
                  {book.isbn && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">ISBN: {book.isbn}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 bg-muted/50 mt-auto flex-col gap-2">
                <div className="text-sm w-full">
                  Stok: <span className={`font-medium ${book.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {book.stock > 0 ? book.stock : "Habis"}
                  </span>
                </div>
                
                {isBookAlreadyBorrowed(book.id) ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full text-amber-600 border-amber-200 bg-amber-50"
                    disabled
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Sudah Dipinjam
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    disabled={book.stock <= 0}
                    onClick={() => handleRequestLoan(book)}
                    className="w-full"
                  >
                    Pinjam
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Request Loan Dialog */}
      <RequestLoanDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        book={selectedBook}
        onSuccess={() => {
          // Handle success (e.g., show toast, refresh data)
          toast.success('Pengajuan peminjaman berhasil dikirim')
          // Perbarui daftar peminjaman aktif setelah berhasil
          // Ini bisa dilakukan dengan refetch data peminjaman aktif atau menambahkan secara lokal
          // Untuk sementara, kita bisa refresh halaman atau memicu fetch ulang data peminjaman aktif
          // atau cukup tampilkan toast dan biarkan user refresh manual jika perlu update instan
          // Jika user ID tersedia, fetch ulang data peminjaman aktif
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