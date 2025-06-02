"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Get the tab from the URL if it exists
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }

    fetchBookLoans();
  }, [session]);

  const fetchBookLoans = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/bookloans?userId=${session.user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch book loans");
      }

      const data = await response.json();

      // Filter loans to only show active ones (PENDING, APPROVED, LATE)
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
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge color="yellow" className="border border-yellow-200">
            Menunggu
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge color="green" className="border border-green-200">
            Disetujui
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge color="red" className="border border-red-200">
            Ditolak
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge color="blue" className="border border-blue-200">
            Dikembalikan
          </Badge>
        );
      case "LATE":
        return (
          <Badge color="gray" className="border border-purple-200">
            Terlambat
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle book return
  const handleReturn = async () => {
    if (!selectedLoan) return;

    try {
      setIsReturning(true);

      const today = new Date().toISOString();

      // Determine if the book is being returned late
      const returnDate = new Date(selectedLoan.returnDate);
      const actualReturnDate = new Date();
      const isLate = actualReturnDate > returnDate;

      // Calculate the new status
      let newStatus = "RETURNED";

      const response = await fetch("/api/bookloans/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedLoan.id,
          actualReturnDate: today,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to return book");
      }

      toast.success("Buku berhasil dikembalikan");

      // Refresh the book loans data
      fetchBookLoans();
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Gagal mengembalikan buku");
    } finally {
      setIsReturning(false);
      setReturnDialogOpen(false);
      setSelectedLoan(null);
    }
  };

  // Function to open return confirmation dialog
  const openReturnDialog = (loan: BookLoan) => {
    setSelectedLoan(loan);
    setReturnDialogOpen(true);
  };

  // Filter loans based on active tab
  const filteredLoans = bookLoans.filter((loan) => {
    if (activeTab === "all") return true;
    return loan.status === activeTab;
  });

  return (
    <div className="w-full mx-auto flex flex-col gap-6">
      {/* Judul dan deskripsi dipindah ke bawah */}

      <div className="w-full mx-auto rounded-xl shadow p-6 mb-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Daftar Peminjaman</h1>
          <p className="text-base text-muted-foreground">
            Kelola dan pantau peminjaman buku Anda
          </p>
        </div>
      </div>

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

      {/* Return Confirmation Dialog */}
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

      {/* Visual cue scroll kanan di mobile */}
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
