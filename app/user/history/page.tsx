"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Search, Calendar, Book } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// BookLoan type with relations
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

export default function HistoryPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [bookLoans, setBookLoans] = useState<BookLoan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchBookLoans = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        // Fetch all loans for this user - no status filtering - all statuses should be shown
        // including PENDING, APPROVED, REJECTED, RETURNED, and LATE
        const response = await fetch(
          `/api/bookloans?userId=${session.user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch book loans");
        }

        const data = await response.json();
        setBookLoans(data);
      } catch (error) {
        console.error("Error fetching book loans:", error);
        toast.error("Gagal memuat data riwayat peminjaman");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchBookLoans();
    }
  }, [session]);

  // Get status badge
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
        return (
          <Badge color="gray" className="border border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Filter loans based on search query and status filter
  // Note: this only filters the display, all loan statuses are still loaded from API
  const filteredLoans = bookLoans.filter(
    (loan) =>
      (statusFilter === "all" || loan.status === statusFilter) &&
      loan.book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate fine if book is returned late
  const calculateFine = (loan: BookLoan) => {
    if (loan.status === "RETURNED" && loan.actualReturnDate) {
      const returnDate = new Date(loan.returnDate);
      const actualReturnDate = new Date(loan.actualReturnDate);

      // If the actual return date is after the due date
      if (actualReturnDate > returnDate) {
        const diffInDays = Math.ceil(
          (actualReturnDate.getTime() - returnDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        // Assume fine is Rp 5,000 per day
        return `Denda: Rp ${(diffInDays * 5000).toLocaleString("id-ID")}`;
      }
    }
    return null;
  };

  return (
    <div className="w-full mx-auto px-4 py-8 flex flex-col gap-6">
      <PageHeader title="Daftar Riwayat Peminjaman" variant="centered" />
      <Card>
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                title="Reset filter"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data riwayat peminjaman
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => (
                <Card
                  key={loan.id}
                  className="overflow-hidden border shadow-sm"
                >
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-20 w-16 bg-muted rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {loan.book.coverImage ? (
                        <img
                          src={loan.book.coverImage}
                          alt={loan.book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Book className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate max-w-[70%]">
                          {loan.book.title}
                        </h3>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {loan.book.author}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tanggal Pinjam:
                          </span>
                          <span>
                            {format(new Date(loan.borrowDate), "d MMM yyyy", {
                              locale: id,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tanggal Kembali:
                          </span>
                          <span>
                            {format(new Date(loan.returnDate), "d MMM yyyy", {
                              locale: id,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tanggal Aktual Kembali:
                          </span>
                          <span>
                            {loan.actualReturnDate
                              ? format(
                                  new Date(loan.actualReturnDate),
                                  "d MMM yyyy",
                                  { locale: id }
                                )
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Catatan:
                          </span>
                          <span className="truncate max-w-[120px]">
                            {loan.notes || "-"}
                          </span>
                        </div>
                        {calculateFine(loan) && (
                          <div className="flex justify-between text-red-600">
                            <span className="font-medium">Denda:</span>
                            <span className="font-medium">
                              {calculateFine(loan)?.split(": ")[1]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
