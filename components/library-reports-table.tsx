"use client"

import { useState } from "react"
import { format, parseISO, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"
import { Book, Search, UserRound } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

// Define types for report data
interface ReportItem {
  id: number
  memberId: number | string
  memberName: string
  bookId: number | string
  bookTitle: string
  borrowDate: string
  returnDate: string | null
  actualReturnDate: string | null
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "LATE"
  lateDays: number
  fine: number
  notes: string
}

interface PopularBook {
  title: string
  count: number
}

interface ActiveMember {
  name: string
  count: number
}

// Get most popular books
const getPopularBooks = (data: ReportItem[]): PopularBook[] => {
  const bookCounts: Record<string, number> = {}
  data.forEach(item => {
    if (!bookCounts[item.bookTitle]) {
      bookCounts[item.bookTitle] = 0
    }
    bookCounts[item.bookTitle]++
  })
  
  return Object.entries(bookCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

// Get most active members
const getActiveMembers = (data: ReportItem[]): ActiveMember[] => {
  const memberCounts: Record<string, number> = {}
  data.forEach(item => {
    if (!memberCounts[item.memberName]) {
      memberCounts[item.memberName] = 0
    }
    memberCounts[item.memberName]++
  })
  
  return Object.entries(memberCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

interface LibraryReportsTableProps {
  type?: "all" | "active" | "overdue" | "popular"
  reportData: ReportItem[]
}

export function LibraryReportsTable({ type = "all", reportData }: LibraryReportsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filter data based on report type
  const filterReportData = () => {
    let filteredData = [...reportData]
    
    // Apply type filter
    if (type === "active") {
      filteredData = filteredData.filter(item => item.status === "APPROVED")
    } else if (type === "overdue") {
      filteredData = filteredData.filter(item => item.status === "LATE")
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      filteredData = filteredData.filter(
        item => 
          item.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filteredData
  }
  
  const filteredData = filterReportData()
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  
  // Format date to Indonesian format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "d MMMM yyyy", { locale: id })
  }
  
  // Format currency to Indonesian Rupiah
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === 0) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }
  
  // Get loan duration in days
  const getLoanDuration = (borrowDate: string | null, returnDate: string | null) => {
    if (!borrowDate || !returnDate) return "-"
    const days = differenceInDays(parseISO(returnDate), parseISO(borrowDate))
    return `${days} hari`
  }
  
  // Get status badge with appropriate color
  const getStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 text-white">
            Diajukan
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-600 text-white">
            Dipinjam
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-600 text-white">
            Ditolak
          </Badge>
        )
      case "RETURNED":
        return (
          <Badge className="border-blue-600 text-blue-600 bg-transparent">
            Dikembalikan
          </Badge>
        )
      case "LATE":
        return (
          <Badge className="bg-orange-500 text-white">
            Terlambat
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>
    }
  }
  
  // If no data, show empty state
  if (reportData.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center space-y-3">
        <p className="text-center text-muted-foreground">Tidak ada data laporan tersedia</p>
      </div>
    )
  }
  
  // Render popular items view for the "popular" tab
  if (type === "popular") {
    const popularBooks = getPopularBooks(reportData)
    const activeMembers = getActiveMembers(reportData)
    
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Book className="h-5 w-5" /> Buku Terpopuler
            </h3>
            <div className="space-y-2">
              {popularBooks.map((book, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <span>{book.title}</span>
                  <Badge>{book.count} peminjaman</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <UserRound className="h-5 w-5" /> Anggota Teraktif
            </h3>
            <div className="space-y-2">
              {activeMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <span>{member.name}</span>
                  <Badge>{member.count} transaksi</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Render the regular table view
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Cari anggota atau judul buku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" className="h-9 px-4">
            <Search className="mr-2 h-4 w-4" />
            Cari
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Anggota</TableHead>
              <TableHead>Judul Buku</TableHead>
              <TableHead>Tanggal Pinjam</TableHead>
              <TableHead>Tanggal Kembali</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lama Pinjam</TableHead>
              <TableHead>Keterlambatan</TableHead>
              <TableHead>Denda</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell>{item.bookTitle}</TableCell>
                  <TableCell>{formatDate(item.borrowDate)}</TableCell>
                  <TableCell>{item.actualReturnDate ? formatDate(item.actualReturnDate) : formatDate(item.returnDate)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{getLoanDuration(item.borrowDate, item.returnDate)}</TableCell>
                  <TableCell>{item.lateDays > 0 ? `${item.lateDays} hari` : "-"}</TableCell>
                  <TableCell>{formatCurrency(item.fine)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.notes || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredData.length > itemsPerPage && (
        <Pagination className="mx-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageToShow = currentPage > 3 ? currentPage - 3 + i + 1 : i + 1
              if (pageToShow <= totalPages) {
                return (
                  <PaginationItem key={pageToShow}>
                    <PaginationLink 
                      isActive={currentPage === pageToShow}
                      onClick={() => setCurrentPage(pageToShow)}
                    >
                      {pageToShow}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              return null
            })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
} 