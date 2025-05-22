"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, BookOpen, Search, ImageIcon, CalendarIcon, Check, Loader2, AlertCircle } from "lucide-react"
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

// Book type definition
type Book = {
  id: number
  title: string
  author: string
  publisher: string | null
  year: number | null
  isbn: string | null
  stock: number
  coverImage: string | null
  createdAt: string
  updatedAt: string
}

// Loan form data type
interface LoanFormData {
  borrowDate: Date | undefined
  returnDate: Date | undefined
  notes: string
}

// Active loan type
type ActiveLoan = {
  bookId: number
  status: string
}

export default function KatalogPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [loanForm, setLoanForm] = useState<LoanFormData>({
    borrowDate: undefined,
    returnDate: undefined,
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([])
  const today = new Date()

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
    setLoanForm({
      borrowDate: undefined,
      returnDate: undefined,
      notes: "",
    })
    setIsRequestDialogOpen(true)
  }

  // Handle date selection
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

  // Handle loan confirmation
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
      
      // Refresh the router to update book list
      router.refresh()
    } catch (error) {
      console.error('Error submitting loan request:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengajukan peminjaman')
    } finally {
      setIsSubmitting(false)
    }
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
                    <Book className="h-4 w-4 opacity-70" />
                    <span>Penerbit: {book.publisher || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 opacity-70" />
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
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 shadow-lg">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">Ajukan Peminjaman Buku</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Anda akan mengajukan peminjaman buku berikut. Peminjaman akan diproses oleh petugas perpustakaan.
            </DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="grid gap-6 px-6 py-6">
              {/* Book Info Section */}
              <div className="flex gap-6 pb-6 border-b">
                <div className="h-48 w-32 overflow-hidden rounded-md shadow-sm bg-slate-100">
                  {selectedBook.coverImage ? (
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground mt-2">Tidak ada sampul</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-600">Karya: {selectedBook.author}</p>
                  <p className="text-sm text-gray-600">Penerbit: {selectedBook.publisher || '-'}</p>
                  <p className="text-sm text-gray-600">Tahun: {selectedBook.year || '-'}</p>
                  <p className="text-sm text-gray-600">
                    Stok: <span className={selectedBook.stock > 0 ? "text-green-600" : "text-red-600"}>
                      {selectedBook.stock > 0 ? selectedBook.stock : "Habis"}
                    </span>
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informasi Peminjaman</AlertTitle>
                <AlertDescription>
                  Setiap pengguna hanya dapat meminjam 1 eksemplar dari judul buku yang sama dalam satu waktu.
                </AlertDescription>
              </Alert>

              {/* Loan Form Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowDate">Tanggal Peminjaman</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !loanForm.borrowDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {loanForm.borrowDate ? (
                          format(loanForm.borrowDate, "PPP", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={loanForm.borrowDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < today}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {loanForm.borrowDate && loanForm.returnDate && (
                  <div className="space-y-2">
                    <Label htmlFor="returnDate">Tanggal Pengembalian</Label>
                    <div className="border rounded-md p-3 bg-muted/30">
                      {format(loanForm.returnDate, "PPP", { locale: id })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Buku harus dikembalikan dalam 7 hari setelah peminjaman
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan untuk petugas perpustakaan..."
                    value={loanForm.notes}
                    onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={confirmRequestLoan} 
              disabled={!loanForm.borrowDate || !loanForm.returnDate || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Ajukan Peminjaman
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 