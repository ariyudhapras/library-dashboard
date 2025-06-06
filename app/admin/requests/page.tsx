"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Book loan type
type BookLoan = {
  id: number;
  userId: number;
  bookId: number;
  borrowDate: string;
  returnDate: string;
  actualReturnDate: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  book: {
    id: number;
    title: string;
    author: string;
    coverImage: string | null;
    stock: number;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookLoans, setBookLoans] = useState<BookLoan[]>([]);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "",
    status: "",
  });

  useEffect(() => {
    fetchBookLoans();
  }, []);

  const fetchBookLoans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bookloans");

      if (!response.ok) {
        throw new Error("Failed to fetch book loans");
      }

      const data = await response.json();
      setBookLoans(data);
    } catch (error) {
      console.error("Error fetching book loans:", error);
      toast.error("Gagal memuat data peminjaman");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (loanId: number, status: string) => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/bookloans", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: loanId,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update loan status");
      }

      // Update local state
      const updatedLoan = await response.json();
      setBookLoans((prev) =>
        prev.map((loan) => (loan.id === loanId ? updatedLoan : loan))
      );

      setConfirmDialog({ open: false, action: "", status: "" });
      toast.success(
        `Status peminjaman berhasil diubah menjadi ${
          status === "APPROVED" ? "Disetujui" : "Ditolak"
        }`
      );

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error updating loan status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status peminjaman"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openConfirmDialog = (
    loan: BookLoan,
    action: string,
    status: string
  ) => {
    setSelectedLoan(loan);
    setConfirmDialog({ open: true, action, status });
  };

  // Filter loans based on active tab
  const filteredLoans = bookLoans.filter((loan) => {
    if (activeTab === "ALL") return true;
    return loan.status === activeTab;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Permintaan Peminjaman"
        description="Kelola permintaan peminjaman buku"
        showAddButton={false}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan Peminjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="PENDING"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="ALL">Semua</TabsTrigger>
              <TabsTrigger value="PENDING">Menunggu</TabsTrigger>
              <TabsTrigger value="APPROVED">Disetujui</TabsTrigger>
              <TabsTrigger value="REJECTED">Ditolak</TabsTrigger>
              <TabsTrigger value="RETURNED">Dikembalikan</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada permintaan peminjaman
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
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.map((loan) => (
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
                                <div className="font-medium">
                                  {loan.book.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {loan.book.author}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{loan.user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {loan.user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.borrowDate), "d MMM yyyy", {
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.returnDate), "d MMM yyyy", {
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>
                            {loan.status === "PENDING" && (
                              <Badge
                                color="yellow"
                                className="border border-yellow-200"
                              >
                                Menunggu
                              </Badge>
                            )}
                            {loan.status === "APPROVED" && (
                              <Badge
                                color="green"
                                className="border border-green-200"
                              >
                                Disetujui
                              </Badge>
                            )}
                            {loan.status === "REJECTED" && (
                              <Badge
                                color="red"
                                className="border border-red-200"
                              >
                                Ditolak
                              </Badge>
                            )}
                            {loan.status === "RETURNED" && (
                              <Badge
                                color="blue"
                                className="border border-blue-200"
                              >
                                Dikembalikan
                              </Badge>
                            )}
                            {loan.status === "LATE" && (
                              <Badge
                                color="gray"
                                className="border border-purple-200"
                              >
                                Terlambat
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {loan.status === "PENDING" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                  onClick={() =>
                                    openConfirmDialog(
                                      loan,
                                      "approve",
                                      "APPROVED"
                                    )
                                  }
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Setujui
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                  onClick={() =>
                                    openConfirmDialog(
                                      loan,
                                      "reject",
                                      "REJECTED"
                                    )
                                  }
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Tolak
                                </Button>
                              </div>
                            )}
                            {loan.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() =>
                                  openConfirmDialog(loan, "return", "RETURNED")
                                }
                              >
                                Tandai Kembali
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "approve" && "Setujui Peminjaman"}
              {confirmDialog.action === "reject" && "Tolak Peminjaman"}
              {confirmDialog.action === "return" && "Konfirmasi Pengembalian"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "approve" &&
                "Apakah Anda yakin ingin menyetujui peminjaman buku ini?"}
              {confirmDialog.action === "reject" &&
                "Apakah Anda yakin ingin menolak peminjaman buku ini?"}
              {confirmDialog.action === "return" &&
                "Apakah Anda yakin buku ini telah dikembalikan?"}
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="py-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-16 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                  {selectedLoan.book.coverImage && (
                    <img
                      src={selectedLoan.book.coverImage}
                      alt={selectedLoan.book.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium">{selectedLoan.book.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Peminjam: {selectedLoan.user.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Periode:{" "}
                    {format(new Date(selectedLoan.borrowDate), "d MMM yyyy", {
                      locale: id,
                    })}{" "}
                    -{" "}
                    {format(new Date(selectedLoan.returnDate), "d MMM yyyy", {
                      locale: id,
                    })}
                  </div>
                </div>
              </div>

              {confirmDialog.action === "approve" &&
                selectedLoan.book.stock <= 0 && (
                  <div className="flex items-center gap-2 p-3 my-2 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Stok buku ini habis. Menyetujui peminjaman ini bisa
                      menyebabkan stok negatif.
                    </span>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, action: "", status: "" })
              }
            >
              Batal
            </Button>
            <Button
              variant={
                confirmDialog.action === "reject" ? "destructive" : "default"
              }
              onClick={() =>
                selectedLoan &&
                handleStatusChange(selectedLoan.id, confirmDialog.status)
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {confirmDialog.action === "approve" && "Setujui"}
                  {confirmDialog.action === "reject" && "Tolak"}
                  {confirmDialog.action === "return" && "Konfirmasi"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
