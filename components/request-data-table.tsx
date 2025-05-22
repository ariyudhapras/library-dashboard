"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { Check, Eye, Search, X } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample request data
const initialRequests = [
  {
    id: 1,
    memberName: "Budi Santoso",
    memberId: "M001",
    memberEmail: "budi.santoso@email.com",
    bookTitle: "Laskar Pelangi",
    bookId: "B001",
    bookAuthor: "Andrea Hirata",
    requestDate: "2023-05-14",
    status: "diajukan", // requested
  },
  {
    id: 2,
    memberName: "Siti Nurhaliza",
    memberId: "M002",
    memberEmail: "siti.nurhaliza@email.com",
    bookTitle: "Bumi Manusia",
    bookId: "B002",
    bookAuthor: "Pramoedya Ananta Toer",
    requestDate: "2023-05-13",
    status: "diajukan", // requested
  },
  {
    id: 3,
    memberName: "Ahmad Dahlan",
    memberId: "M003",
    memberEmail: "ahmad.dahlan@email.com",
    bookTitle: "Filosofi Teras",
    bookId: "B003",
    bookAuthor: "Henry Manampiring",
    requestDate: "2023-05-12",
    status: "disetujui", // approved
  },
  {
    id: 4,
    memberName: "Dewi Lestari",
    memberId: "M004",
    memberEmail: "dewi.lestari@email.com",
    bookTitle: "Perahu Kertas",
    bookId: "B004",
    bookAuthor: "Dee Lestari",
    requestDate: "2023-05-11",
    status: "ditolak", // rejected
  },
  {
    id: 5,
    memberName: "Rudi Hartono",
    memberId: "M005",
    memberEmail: "rudi.hartono@email.com",
    bookTitle: "Pulang",
    bookId: "B005",
    bookAuthor: "Tere Liye",
    requestDate: "2023-05-10",
    status: "disetujui", // approved
  },
]

export default function RequestDataTable() {
  const [requests, setRequests] = useState(initialRequests)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const handleApprove = (request) => {
    setSelectedRequest(request)
    setIsApproveDialogOpen(true)
  }

  const handleReject = (request) => {
    setSelectedRequest(request)
    setIsRejectDialogOpen(true)
  }

  const handleDetail = (request) => {
    setSelectedRequest(request)
    setIsDetailDialogOpen(true)
  }

  const confirmApprove = () => {
    const updatedRequests = requests.map((request) => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: "disetujui",
        }
      }
      return request
    })
    setRequests(updatedRequests)
    setIsApproveDialogOpen(false)
  }

  const confirmReject = () => {
    const updatedRequests = requests.map((request) => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: "ditolak",
        }
      }
      return request
    })
    setRequests(updatedRequests)
    setIsRejectDialogOpen(false)
  }

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
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "d MMMM yyyy", { locale: id })
  }

  // Filter requests based on search query and active tab
  const filteredRequests = requests.filter(
    (request) =>
      (activeTab === "all" ||
        (activeTab === "pending" && request.status === "diajukan") ||
        (activeTab === "approved" && request.status === "disetujui") ||
        (activeTab === "rejected" && request.status === "ditolak")) &&
      (request.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Daftar Pengajuan Peminjaman</CardTitle>
          <CardDescription>Kelola pengajuan peminjaman buku perpustakaan</CardDescription>
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="pending">Diajukan</TabsTrigger>
                <TabsTrigger value="approved">Disetujui</TabsTrigger>
                <TabsTrigger value="rejected">Ditolak</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Anggota</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Pengajuan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{request.memberName}</TableCell>
                      <TableCell>{request.bookTitle}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(request.requestDate)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {request.status === "diajukan" ? (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleApprove(request)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Setujui</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleReject(request)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Tolak</span>
                              </Button>
                            </>
                          ) : null}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDetail(request)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Detail</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <p className="text-sm text-muted-foreground">Tidak ada data pengajuan yang ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Persetujuan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui pengajuan peminjaman buku &quot;
              {selectedRequest?.bookTitle}&quot; oleh {selectedRequest?.memberName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmApprove}>Setujui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penolakan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menolak pengajuan peminjaman buku &quot;
              {selectedRequest?.bookTitle}&quot; oleh {selectedRequest?.memberName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Peminjaman</DialogTitle>
            <DialogDescription>Informasi lengkap tentang pengajuan peminjaman buku.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={selectedRequest.memberName} />
                  <AvatarFallback>{selectedRequest.memberName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedRequest.memberName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRequest.memberEmail}</p>
                  <p className="text-sm text-muted-foreground">ID Anggota: {selectedRequest.memberId}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Informasi Buku</h4>
                <div className="rounded-md border p-3">
                  <p className="font-medium">{selectedRequest.bookTitle}</p>
                  <p className="text-sm text-muted-foreground">Penulis: {selectedRequest.bookAuthor}</p>
                  <p className="text-sm text-muted-foreground">ID Buku: {selectedRequest.bookId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Tanggal Pengajuan</p>
                  <p>{formatDate(selectedRequest.requestDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest && selectedRequest.status === "diajukan" && (
              <>
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => {
                    setIsDetailDialogOpen(false)
                    setSelectedRequest(selectedRequest)
                    setIsRejectDialogOpen(true)
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Tolak
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false)
                    setSelectedRequest(selectedRequest)
                    setIsApproveDialogOpen(true)
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Setujui
                </Button>
              </>
            )}
            {selectedRequest && selectedRequest.status !== "diajukan" && (
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Tutup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
