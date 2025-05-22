"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { Book, Check, Clock, Eye, LayoutDashboard, Users, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Sample statistics data
const statisticsData = {
  totalBooks: 1248,
  registeredMembers: 843,
  activeLoans: 124,
  overdueBooks: 18,
}

// Sample recent loan requests data
const initialRecentRequests = [
  {
    id: 1,
    memberName: "Budi Santoso",
    bookTitle: "Laskar Pelangi",
    requestDate: "2023-05-14",
    status: "diajukan", // requested
  },
  {
    id: 2,
    memberName: "Siti Nurhaliza",
    bookTitle: "Bumi Manusia",
    requestDate: "2023-05-13",
    status: "diajukan", // requested
  },
  {
    id: 3,
    memberName: "Ahmad Dahlan",
    bookTitle: "Filosofi Teras",
    requestDate: "2023-05-12",
    status: "disetujui", // approved
  },
  {
    id: 4,
    memberName: "Dewi Lestari",
    bookTitle: "Perahu Kertas",
    requestDate: "2023-05-11",
    status: "ditolak", // rejected
  },
  {
    id: 5,
    memberName: "Rudi Hartono",
    bookTitle: "Pulang",
    requestDate: "2023-05-10",
    status: "disetujui", // approved
  },
]

export default function Dashboard() {
  const [recentRequests, setRecentRequests] = useState(initialRecentRequests)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

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
    const updatedRequests = recentRequests.map((request) => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: "disetujui",
        }
      }
      return request
    })
    setRecentRequests(updatedRequests)
    setIsApproveDialogOpen(false)
  }

  const confirmReject = () => {
    const updatedRequests = recentRequests.map((request) => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: "ditolak",
        }
      }
      return request
    })
    setRecentRequests(updatedRequests)
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Buku"
          value={statisticsData.totalBooks}
          icon={<Book className="h-6 w-6 text-blue-600" />}
          className="border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
        />
        <StatCard
          title="Anggota Terdaftar"
          value={statisticsData.registeredMembers}
          icon={<Users className="h-6 w-6 text-green-600" />}
          className="border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-950"
        />
        <StatCard
          title="Peminjaman Aktif"
          value={statisticsData.activeLoans}
          icon={<LayoutDashboard className="h-6 w-6 text-amber-600" />}
          className="border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
        />
        <StatCard
          title="Buku Terlambat"
          value={statisticsData.overdueBooks}
          icon={<Clock className="h-6 w-6 text-red-600" />}
          className="border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950"
        />
      </div>

      {/* Recent Loan Requests */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Pengajuan Peminjaman Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Anggota</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Pengajuan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id}>
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
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDetail(request)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Detail</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Peminjaman</DialogTitle>
            <DialogDescription>Informasi lengkap tentang pengajuan peminjaman buku.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4">
              <div>
                <h3 className="mb-1 text-sm font-medium">Nama Anggota</h3>
                <p>{selectedRequest.memberName}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">Judul Buku</h3>
                <p>{selectedRequest.bookTitle}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">Tanggal Pengajuan</h3>
                <p>{formatDate(selectedRequest.requestDate)}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">Status</h3>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ title, value, icon, className }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  )
}
