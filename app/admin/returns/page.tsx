"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCheck, Loader2, AlertCircle, Search } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export default function AdminReturnsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [returnedBooks, setReturnedBooks] = useState<BookLoan[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: "", status: "" })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchReturnedBooks()
  }, [])

  const fetchReturnedBooks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/returns')
      
      if (!response.ok) {
        throw new Error('Failed to fetch returned books')
      }
      
      const data = await response.json()
      setReturnedBooks(data)
    } catch (error) {
      console.error('Error fetching returned books:', error)
      toast.error('Gagal memuat data pengembalian')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyReturn = async (loanId: number) => {
    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/returns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: loanId,
          status: 'VERIFIED_RETURNED',
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to verify return')
      }
      
      // Update local state
      const updatedLoan = await response.json()
      setReturnedBooks(prev => 
        prev.map(loan => 
          loan.id === loanId ? updatedLoan : loan
        )
      )
      
      setConfirmDialog({ open: false, action: "", status: "" })
      toast.success('Pengembalian buku berhasil diverifikasi')
      
      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error('Error verifying return:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal memverifikasi pengembalian')
    } finally {
      setIsProcessing(false)
    }
  }

  const openConfirmDialog = (loan: BookLoan) => {
    setSelectedLoan(loan)
    setConfirmDialog({ open: true, action: "verify", status: "VERIFIED_RETURNED" })
  }

  // Filter returned books based on search query
  const filteredBooks = returnedBooks.filter(loan => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      loan.book.title.toLowerCase().includes(searchTerm) ||
      loan.user.name.toLowerCase().includes(searchTerm) ||
      loan.user.email.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Pengembalian" 
        description="Kelola pengembalian buku perpustakaan" 
        showAddButton={false}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengembalian Buku</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari buku atau peminjam..."
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
          ) : filteredBooks.length === 0 ? (
            <div className="rounded-md border p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Tidak ada data pengembalian</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Belum ada buku yang dikembalikan atau data tidak tersedia.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buku</TableHead>
                    <TableHead>Peminjam</TableHead>
                    <TableHead>Tanggal Pinjam</TableHead>
                    <TableHead>Tanggal Kembali</TableHead>
                    <TableHead>Tanggal Aktual Kembali</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((loan) => (
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
                          <div>
                            <div className="font-medium">{loan.book.title}</div>
                            <div className="text-sm text-muted-foreground">{loan.book.author}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{loan.user.name}</div>
                        <div className="text-sm text-muted-foreground">{loan.user.email}</div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(loan.borrowDate), "d MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(loan.returnDate), "d MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>
                        {loan.actualReturnDate ? 
                          format(new Date(loan.actualReturnDate), "d MMM yyyy", { locale: id }) : 
                          "-"
                        }
                      </TableCell>
                      <TableCell>
                        {loan.status === 'RETURNED' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Dikembalikan</Badge>
                        )}
                        {loan.status === 'VERIFIED_RETURNED' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terverifikasi</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {loan.notes || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {loan.status === 'RETURNED' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                            onClick={() => openConfirmDialog(loan)}
                          >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Verifikasi
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8"
                            disabled
                          >
                            Terverifikasi
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi Pengembalian</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memverifikasi pengembalian buku ini?
              {selectedLoan && (
                <div className="mt-2 text-sm font-medium text-foreground">
                  Buku: {selectedLoan.book.title}
                  <br />
                  Peminjam: {selectedLoan.user.name}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={() => selectedLoan && handleVerifyReturn(selectedLoan.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Verifikasi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 