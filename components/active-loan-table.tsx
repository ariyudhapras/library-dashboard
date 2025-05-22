"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { Book, Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Book loan type
type BookLoan = {
  id: number
  userId: number
  bookId: number
  borrowDate: string
  returnDate: string
  actualReturnDate: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  book: {
    id: number
    title: string
    author: string
    coverImage: string | null
    stock: number
  }
  user: {
    id: number
    name: string
    email: string
  }
}

export default function ActiveLoanTable() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLoans, setActiveLoans] = useState<BookLoan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActiveLoans = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/bookloans?userId=${session.user.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch book loans')
        }
        
        const data = await response.json()
        
        // Filter out only active loans (not returned or rejected)
        const activeLoans = data.filter((loan: BookLoan) => 
          loan.status !== 'RETURNED' && 
          loan.status !== 'REJECTED' &&
          loan.status !== 'VERIFIED_RETURNED'
        )
        
        setActiveLoans(activeLoans)
      } catch (error) {
        console.error('Error fetching active loans:', error)
        toast.error('Gagal memuat data peminjaman aktif')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchActiveLoans()
    }
  }, [session])

  // Filter loans based on search query
  const filteredLoans = activeLoans.filter((loan) =>
    loan.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loan.book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format date to Indonesian locale
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "d MMMM yyyy", { locale: id })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>
      case "LATE":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Terlambat</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Daftar Peminjaman Aktif</CardTitle>
        <CardDescription>Buku-buku yang sedang Anda pinjam</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari judul buku..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Desktop view - Table layout */}
            <div className="hidden md:block">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Buku</TableHead>
                      <TableHead>Penulis</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoans.length > 0 ? (
                      filteredLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-9 bg-muted rounded overflow-hidden flex-shrink-0">
                                {loan.book.coverImage && (
                                  <img 
                                    src={loan.book.coverImage} 
                                    alt={loan.book.title}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="font-medium">{loan.book.title}</div>
                            </div>
                          </TableCell>
                          <TableCell>{loan.book.author}</TableCell>
                          <TableCell>{formatDate(loan.borrowDate)}</TableCell>
                          <TableCell>{formatDate(loan.returnDate)}</TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Book className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Tidak ada peminjaman aktif</p>
                            {searchQuery && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                              >
                                Reset Pencarian
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile view - Card layout for each item */}
            <div className="grid gap-4 md:hidden">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <div key={loan.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {loan.book.coverImage && (
                          <img 
                            src={loan.book.coverImage} 
                            alt={loan.book.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{loan.book.title}</h3>
                        <p className="text-sm text-muted-foreground">{loan.book.author}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        Tanggal Pinjam: {formatDate(loan.borrowDate)}
                      </p>
                      <p className="text-muted-foreground">
                        Jatuh Tempo: {formatDate(loan.returnDate)}
                      </p>
                    </div>
                    <div className="mt-3">{getStatusBadge(loan.status)}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-8 text-center">
                  <Book className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Tidak ada peminjaman aktif</p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 