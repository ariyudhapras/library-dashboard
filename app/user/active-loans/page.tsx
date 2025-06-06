"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function ActiveLoansPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookLoans, setBookLoans] = useState<BookLoan[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isReturning, setIsReturning] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null);

  const handleCancelLoan = async (loanId: number) => {
    try {
      const res = await fetch(`/api/bookloans/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: loanId }),
      });
      if (!res.ok) throw new Error("Gagal membatalkan peminjaman");
      toast.success("Peminjaman berhasil dibatalkan");
      fetchBookLoans(); // Refresh data
    } catch (err) {
      toast.error("Terjadi kesalahan saat membatalkan");
      console.error(err);
    }
  };

  const fetchBookLoans = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookloans?userId=${session.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch book loans");
      }
      const data = await response.json();
      const activeLoans = data.filter((loan: BookLoan) =>
        ["PENDING", "APPROVED", "LATE"].includes(loan.status)
      );
      setBookLoans(activeLoans);
    } catch (error) {
      console.error("Error fetching book loans:", error);
      toast.error("Gagal memuat data peminjaman");
    } finally {
      setIsLoading(false);
    }
  }, [session]); 

  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
    fetchBookLoans();
  }, [fetchBookLoans, setActiveTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menunggu</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-500 hover:bg-green-600">Disetujui</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500 hover:bg-red-600">Ditolak</Badge>;
      case "RETURNED":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Dikembalikan</Badge>;
      case "LATE":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Terlambat</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleReturn = async () => {
    if (!selectedLoan) return;
    setIsReturning(true);
    try {
      const today = new Date().toISOString();
      const response = await fetch("/api/bookloans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLoan.id,
          actualReturnDate: today,
          status: "RETURNED", 
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to return book");
      }
      toast.success("Buku berhasil dikembalikan");
      fetchBookLoans(); // Refresh data
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Gagal mengembalikan buku");
    } finally {
      setIsReturning(false);
      setReturnDialogOpen(false);
      setSelectedLoan(null);
    }
  };

  const openReturnDialog = (loan: BookLoan) => {
    setSelectedLoan(loan);
    setReturnDialogOpen(true);
  };

  const filteredLoans = bookLoans.filter((loan: BookLoan) => {
    if (activeTab === "all") return true;
    return loan.status === activeTab;
  });

  return (
    <div className="w-full mx-auto flex flex-col gap-6">
      <PageHeader
        title="Daftar Peminjaman"
        description="Kelola dan pantau peminjaman buku Anda"
        variant="centered"
      />
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="PENDING">Menunggu</TabsTrigger>
              <TabsTrigger value="APPROVED">Disetujui</TabsTrigger>
              <TabsTrigger value="LATE">Terlambat</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data peminjaman
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 bg-white">
                          Buku
                        </TableHead>
                        <TableHead>Tanggal Pinjam</TableHead>
                        <TableHead>Tanggal Kembali</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium sticky left-0 z-10 bg-white">
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
                            {format(new Date(loan.borrowDate), "d MMM yyyy", {
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(loan.returnDate), "d MMM yyyy", {
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {loan.notes || "-"}
                          </TableCell>
                          <TableCell>
                            {(loan.status === "APPROVED" ||
                              loan.status === "LATE") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReturnDialog(loan)}
                              >
                                Kembalikan
                              </Button>
                            )}
                            {loan.status === "PENDING" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelLoan(loan.id)}
                                className="ml-2"
                              >
                                Batalkan
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
      <AlertDialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengembalian Buku</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengembalikan buku "
              {selectedLoan?.book.title}"?
              {new Date() > new Date(selectedLoan?.returnDate || "") && (
                <p className="mt-2 text-red-500">
                  Buku ini terlambat dikembalikan. Anda mungkin dikenakan denda
                  sesuai kebijakan perpustakaan.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReturning}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReturn}
              disabled={isReturning}
              className={isReturning ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isReturning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Kembalikan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="block md:hidden text-xs text-center text-muted-foreground mt-2 select-none">
        <span className="inline-flex items-center gap-1">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 18l6-6-6-6" />
          </svg>
          Geser ke kanan untuk melihat detail
        </span>
      </div>
    </div>
  );
}

