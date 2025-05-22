"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { Book, Calendar, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample loan history data
const sampleLoanHistory = [
  {
    id: 1,
    bookTitle: "Laskar Pelangi",
    requestDate: "2023-05-10",
    approvalDate: "2023-05-11",
    returnDate: "2023-05-25",
    status: "dikembalikan", // returned
  },
  {
    id: 2,
    bookTitle: "Bumi Manusia",
    requestDate: "2023-06-05",
    approvalDate: "2023-06-06",
    returnDate: null,
    status: "disetujui", // approved
  },
  {
    id: 3,
    bookTitle: "Filosofi Teras",
    requestDate: "2023-06-15",
    approvalDate: null,
    returnDate: null,
    status: "diajukan", // requested
  },
  {
    id: 4,
    bookTitle: "Perahu Kertas",
    requestDate: "2023-06-20",
    approvalDate: null,
    returnDate: null,
    status: "ditolak", // rejected
  },
  {
    id: 5,
    bookTitle: "Pulang",
    requestDate: "2023-07-01",
    approvalDate: "2023-07-02",
    returnDate: "2023-07-15",
    status: "dikembalikan", // returned
  },
  {
    id: 6,
    bookTitle: "Negeri 5 Menara",
    requestDate: "2023-07-10",
    approvalDate: "2023-07-11",
    returnDate: null,
    status: "disetujui", // approved
  },
  {
    id: 7,
    bookTitle: "Sang Pemimpi",
    requestDate: "2023-07-20",
    approvalDate: null,
    returnDate: null,
    status: "diajukan", // requested
  },
]

export default function LoanHistoryTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Format date to Indonesian format
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return format(parseISO(dateString), "d MMMM yyyy", { locale: id })
  }

  // Get status badge with appropriate color
  const getStatusBadge = (status) => {
    switch (status) {
      case "diajukan":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Diajukan
          </Badge>
        )
      case "disetujui":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Disetujui
          </Badge>
        )
      case "ditolak":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Ditolak
          </Badge>
        )
      case "dikembalikan":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Dikembalikan
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter loan history based on search query and status filter
  const filteredHistory = sampleLoanHistory.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      item.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Daftar Riwayat Peminjaman</CardTitle>
        <CardDescription>Semua riwayat peminjaman buku Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="diajukan">Diajukan</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
                <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
              title="Reset filter"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Pengajuan</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Disetujui</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Kembali</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.bookTitle}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(item.requestDate)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(item.approvalDate)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(item.returnDate)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Book className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Tidak ada riwayat peminjaman yang ditemukan</p>
                        {(searchQuery || statusFilter !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("")
                              setStatusFilter("all")
                            }}
                          >
                            Reset Filter
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
        <div className="mt-4 space-y-4 md:hidden">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{item.bookTitle}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Pengajuan:</span>
                      <span>{formatDate(item.requestDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Disetujui:</span>
                      <span>{formatDate(item.approvalDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Kembali:</span>
                      <span>{formatDate(item.returnDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-8 text-center">
              <Book className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tidak ada riwayat peminjaman yang ditemukan</p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
