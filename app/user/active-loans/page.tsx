"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, BookOpen } from "lucide-react";
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
      if (!res.ok) throw new Error("Failed to cancel loan");
      toast.success("Loan request cancelled successfully");
      fetchBookLoans();
    } catch (err) {
      toast.error("Error occurred while cancelling");
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
      toast.error("Failed to load loan data");
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
        return <Badge className={baseClasses}>{status}</Badge>;
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
      toast.success("Book returned successfully");
      fetchBookLoans();
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book");
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
    <div className="w-full mx-auto flex flex-col gap-8 p-6">
      <PageHeader
        title="Active Loans"
        description="Manage and track your book loans."
        variant="centered"
      />

      <Card className="shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Your Book Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            {/* ENLARGED TABS */}
            <TabsList className="mb-8 bg-gray-100 p-2 rounded-xl h-auto">
              <TabsTrigger
                value="all"
                className="text-lg font-semibold px-8 py-4 rounded-lg"
              >
                All Loans
              </TabsTrigger>
              <TabsTrigger
                value="PENDING"
                className="text-lg font-semibold px-8 py-4 rounded-lg"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="APPROVED"
                className="text-lg font-semibold px-8 py-4 rounded-lg"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="LATE"
                className="text-lg font-semibold px-8 py-4 rounded-lg"
              >
                Overdue
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                    <p className="text-lg text-gray-600">
                      Loading your loans...
                    </p>
                  </div>
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Active Loans
                  </h3>
                  <p className="text-lg text-gray-600">
                    You don't have any loans in this category.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                  {/* Now using the enhanced base Table component */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Details</TableHead>
                        <TableHead>Borrow Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.map((loan, index) => (
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
                              {format(
                                new Date(loan.borrowDate),
                                "MMM dd, yyyy",
                                { locale: enUS }
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-gray-500" />
                              {format(
                                new Date(loan.returnDate),
                                "MMM dd, yyyy",
                                { locale: enUS }
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell className="max-w-[250px]">
                            <p className="truncate text-gray-600">
                              {loan.notes || "No notes available"}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-3 justify-end">
                              {(loan.status === "APPROVED" ||
                                loan.status === "LATE") && (
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => openReturnDialog(loan)}
                                  className="text-base font-semibold px-6 py-3"
                                >
                                  Return Book
                                </Button>
                              )}
                              {loan.status === "PENDING" && (
                                <Button
                                  variant="destructive"
                                  size="lg"
                                  onClick={() => handleCancelLoan(loan.id)}
                                  className="text-base font-semibold px-6 py-3"
                                >
                                  Cancel Request
                                </Button>
                              )}
                            </div>
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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Confirm Book Return
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              Are you sure you want to return{" "}
              <span className="font-semibold">
                "{selectedLoan?.book.title}"
              </span>
              ?
              {new Date() > new Date(selectedLoan?.returnDate || "") && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <strong>⚠️ Overdue Notice:</strong> This book is past its due
                  date. You may be charged a late fee according to library
                  policy.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              disabled={isReturning}
              className="text-base font-semibold px-6 py-3"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReturn}
              disabled={isReturning}
              className={`text-base font-semibold px-6 py-3 ${
                isReturning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isReturning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Return Book"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
