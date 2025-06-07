"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Calendar, BookOpen, FilterX } from "lucide-react";
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
        toast.error("Failed to load loan history");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchBookLoans();
    }
  }, [session]);

  // Get status badge - same styling as Active Loans
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-4 py-2 text-base font-semibold rounded-full";

    switch (status) {
      case "PENDING":
        return (
          <Badge
            className={`${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`}
          >
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            className={`${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`}
          >
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            className={`${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`}
          >
            Rejected
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge
            className={`${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`}
          >
            Returned
          </Badge>
        );
      case "LATE":
        return (
          <Badge
            className={`${baseClasses} bg-purple-100 text-purple-800 hover:bg-purple-200`}
          >
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </Badge>
        );
    }
  };

  // Filter loans based on search query and status filter
  const filteredLoans = bookLoans.filter(
    (loan) =>
      (statusFilter === "all" || loan.status === statusFilter) &&
      (loan.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate fine if book is returned late
  const calculateFine = (loan: BookLoan) => {
    if (loan.status === "RETURNED" && loan.actualReturnDate) {
      const returnDate = new Date(loan.returnDate);
      const actualReturnDate = new Date(loan.actualReturnDate);

      if (actualReturnDate > returnDate) {
        const diffInDays = Math.ceil(
          (actualReturnDate.getTime() - returnDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return diffInDays * 5000; // Rp 5,000 per day
      }
    }
    return 0;
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-8 p-6">
      <PageHeader
        title="Loan History"
        description="View your complete borrowing history and track past transactions."
        variant="centered"
      />

      <Card className="shadow-xl">
        <CardContent className="space-y-8">
          {/* Enhanced Filter Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 bg-gray-50 rounded-xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by book title or author..."
                className="pl-10 text-base py-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] text-base py-3">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="LATE">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="text-base px-4 py-3"
                title="Reset filters"
              >
                <FilterX className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {!isLoading && (
            <div className="text-base text-gray-600 px-2">
              Showing{" "}
              <span className="font-semibold">{filteredLoans.length}</span> of{" "}
              <span className="font-semibold">{bookLoans.length}</span> loans
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                <p className="text-lg text-gray-600">Loading your history...</p>
              </div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {bookLoans.length === 0
                  ? "No Loan History"
                  : "No Results Found"}
              </h3>
              <p className="text-lg text-gray-600">
                {bookLoans.length === 0
                  ? "You haven't borrowed any books yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {bookLoans.length > 0 && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4 text-base px-6 py-3"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Using Enhanced Table Component */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Details</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan, index) => {
                    const fine = calculateFine(loan);
                    return (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                              {loan.book.coverImage ? (
                                <img
                                  src={loan.book.coverImage}
                                  alt={loan.book.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                                {loan.book.title}
                              </h4>
                              <p className="text-base text-gray-600">
                                by {loan.book.author}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            {format(new Date(loan.borrowDate), "MMM dd, yyyy", {
                              locale: enUS,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            {format(new Date(loan.returnDate), "MMM dd, yyyy", {
                              locale: enUS,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {loan.actualReturnDate ? (
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-gray-500" />
                              {format(
                                new Date(loan.actualReturnDate),
                                "MMM dd, yyyy",
                                { locale: enUS }
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Not returned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          {fine > 0 ? (
                            <div className="text-red-600 font-semibold">
                              ${fine.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-gray-600">
                            {loan.notes || "No notes"}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile scroll helper */}
      <div className="block md:hidden text-sm text-center text-muted-foreground mt-4 select-none">
        <span className="inline-flex items-center gap-2">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 18l6-6-6-6" />
          </svg>
          Swipe right to see more details
        </span>
      </div>
    </div>
  );
}
