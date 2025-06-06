"use client"

import { useState } from "react"
import { format, differenceInDays, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface ReturnItem {
  id: number;
  memberName: string;
  bookTitle: string;
  dueDate: string;
  returnDate: string | null;
  status: "dipinjam" | "terlambat" | "dikembalikan";
  fine: number;
}

// Sample return data
const initialReturns: ReturnItem[] = [
  {
    id: 1,
    memberName: "Budi Santoso",
    bookTitle: "Laskar Pelangi",
    dueDate: "2023-05-10",
    returnDate: null,
    status: "dipinjam", // borrowed
    fine: 0,
  },
  {
    id: 2,
    memberName: "Siti Nurhaliza",
    bookTitle: "Bumi Manusia",
    dueDate: "2023-05-05",
    returnDate: null,
    status: "terlambat", // late
    fine: 0,
  },
  {
    id: 3,
    memberName: "Ahmad Dahlan",
    bookTitle: "Filosofi Teras",
    dueDate: "2023-05-15",
    returnDate: null,
    status: "dipinjam", // borrowed
    fine: 0,
  },
  {
    id: 4,
    memberName: "Dewi Lestari",
    bookTitle: "Perahu Kertas",
    dueDate: "2023-04-28",
    returnDate: null,
    status: "terlambat", // late
    fine: 0,
  },
  {
    id: 5,
    memberName: "Rudi Hartono",
    bookTitle: "Pulang",
    dueDate: "2023-05-01",
    returnDate: "2023-05-08",
    status: "dikembalikan", // returned
    fine: 35000,
  },
]

// Calculate fine based on days late (Rp 5,000 per day)
const calculateFine = (dueDate: string, returnDate: string | null): number => {
  if (!returnDate) {
    // If not returned yet, calculate fine based on current date
    const today = new Date()
    const due = parseISO(dueDate)
    const daysLate = differenceInDays(today, due)
    return daysLate > 0 ? daysLate * 5000 : 0
  } else {
    // If returned, calculate fine based on return date
    const returned = parseISO(returnDate)
    const due = parseISO(dueDate)
    const daysLate = differenceInDays(returned, due)
    return daysLate > 0 ? daysLate * 5000 : 0
  }
}

// Format currency to Indonesian Rupiah
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ReturnDataTable(): JSX.Element {
  const [returns, setReturns] = useState<ReturnItem[]>(
    initialReturns.map((item: ReturnItem): ReturnItem => ({
      ...item,
      fine: calculateFine(item.dueDate, item.returnDate),
    })),
  )
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleReturn = (returnItem: ReturnItem): void => {
    setSelectedReturn(returnItem)
    setIsReturnDialogOpen(true)
  }

  const confirmReturn = (): void => {
    if (!selectedReturn) return;
    const today = new Date()
    const updatedReturns = returns.map((returnItem: ReturnItem): ReturnItem => {
      if (returnItem.id === selectedReturn!.id) { // selectedReturn is checked above
        const returnDate = format(today, "yyyy-MM-dd")
        const fine = calculateFine(returnItem.dueDate, returnDate)
        return {
          ...returnItem,
          returnDate,
          status: "dikembalikan",
          fine,
        }
      }
      return returnItem
    })
    setReturns(updatedReturns)
    setIsReturnDialogOpen(false)
  }

  const getStatusBadge = (status: ReturnItem['status']): JSX.Element => {
    switch (status) {
      case "dipinjam":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Dipinjam
          </Badge>
        )
      case "terlambat":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Terlambat
          </Badge>
        )
      case "dikembalikan":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Dikembalikan
          </Badge>
        )
      default:
        return <Badge color="gray">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "d MMMM yyyy", { locale: id })
  }

  // Filter returns based on search query
  const filteredReturns = returns.filter((returnItem: ReturnItem): boolean =>
      returnItem.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Daftar Pengembalian</CardTitle>
          <CardDescription>Kelola pengembalian buku perpustakaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari anggota atau buku..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                Dipinjam
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                Terlambat
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Dikembalikan
              </Badge>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Anggota</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Tempo</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Kembali</TableHead>
                  <TableHead>Denda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((returnItem: ReturnItem, index: number) => (
                  <TableRow key={returnItem.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{returnItem.memberName}</TableCell>
                    <TableCell>{returnItem.bookTitle}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(returnItem.dueDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(returnItem.returnDate)}</TableCell>
                    <TableCell>{formatCurrency(returnItem.fine)}</TableCell>
                    <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                    <TableCell className="text-right">
                      {returnItem.status !== "dikembalikan" ? (
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleReturn(returnItem)}>
                          <RotateCcw className="mr-2 h-3.5 w-3.5" />
                          Kembalikan
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8" disabled>
                          Selesai
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReturns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Tidak ada data pengembalian yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Return Confirmation Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengembalian</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memproses pengembalian buku &quot;
              {selectedReturn?.bookTitle}&quot; oleh {selectedReturn?.memberName}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Tanggal Tempo</p>
                <p className="text-sm">{selectedReturn && formatDate(selectedReturn.dueDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Kembali</p>
                <p className="text-sm">{format(new Date(), "d MMMM yyyy", { locale: id })}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Denda</p>
              <p className="text-sm font-semibold text-red-600">
                {selectedReturn &&
                  formatCurrency(calculateFine(selectedReturn.dueDate, format(new Date(), "yyyy-MM-dd")))}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmReturn}>Konfirmasi Pengembalian</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
