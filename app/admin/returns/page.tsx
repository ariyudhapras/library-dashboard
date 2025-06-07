"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CheckCheck,
  Loader2,
  AlertCircle,
  Search,
  BookOpen,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Enhanced Avatar Component for Returns Management
interface BorrowerAvatarProps {
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  size?: "sm" | "md" | "lg";
}

const BorrowerAvatar = ({ user, size = "md" }: BorrowerAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // If user has profileImage, show real photo
  if (user.profileImage && user.profileImage.trim() !== "") {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-md flex-shrink-0 border-2 border-white relative`}
      >
        <img
          src={user.profileImage}
          alt={`${user.name}'s profile`}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.className = `${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0`;
              parent.innerHTML = `<span class="text-white font-bold">${getInitials(
                user.name
              )}</span>`;
            }
          }}
        />
      </div>
    );
  }

  // If no profileImage, show initials
  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0`}
    >
      <span className="text-white font-bold">{getInitials(user.name)}</span>
    </div>
  );
};

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
    profileImage?: string | null;
  };
};

export default function AdminReturnsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [returnedBooks, setReturnedBooks] = useState<BookLoan[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReturnedBooks();
  }, []);

  const fetchReturnedBooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/returns");

      if (!response.ok) {
        throw new Error("Failed to fetch returned books");
      }

      const data = await response.json();
      setReturnedBooks(data);
    } catch (error) {
      console.error("Error fetching returned books:", error);
      toast.error("Failed to load returns data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReturn = async (loanId: number) => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/returns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: loanId,
          status: "VERIFIED_RETURNED",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify return");
      }

      // Update local state
      const updatedLoan = await response.json();
      setReturnedBooks((prev) =>
        prev.map((loan) => (loan.id === loanId ? updatedLoan : loan))
      );

      setConfirmDialog({ open: false, action: "", status: "" });
      toast.success("Book return verified successfully");

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error verifying return:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to verify return"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openConfirmDialog = (loan: BookLoan) => {
    setSelectedLoan(loan);
    setConfirmDialog({
      open: true,
      action: "verify",
      status: "VERIFIED_RETURNED",
    });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter is handled in filteredBooks below
  };

  // Filter returned books based on search query
  const filteredBooks = returnedBooks.filter((loan) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      loan.book.title.toLowerCase().includes(searchTerm) ||
      loan.user.name.toLowerCase().includes(searchTerm) ||
      loan.user.email.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="w-full mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      {/* ENHANCED HEADER - Matching User Style */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight">
            Returns Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2">
            Manage and verify book returns from library members.
          </p>
        </div>
      </div>

      {/* ENHANCED SEARCH SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by book title, borrower name, or email..."
              className="pl-10 text-base py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="text-base px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* ENHANCED TABLE WITH BETTER STYLING */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-white">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg text-gray-600">Loading returns data...</p>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Returns Found
            </h3>
            <p className="text-base text-gray-600">
              {searchQuery
                ? "No returns match your search criteria."
                : "No books have been returned yet or data is not available."}
            </p>
          </div>
        ) : (
          <>
            {/* Enhanced Returns table */}
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Book Details
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Borrower
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Borrow Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Due Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Return Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Notes
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((loan) => (
                  <TableRow
                    key={loan.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      {/* ENHANCED BOOK DETAILS - Matching User Style */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-16 w-12 sm:h-20 sm:w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                          {loan.book.coverImage ? (
                            <img
                              src={loan.book.coverImage}
                              alt={loan.book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-1 leading-tight">
                            {loan.book.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            by {loan.book.author}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <BorrowerAvatar user={loan.user} size="md" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {loan.user.name}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {loan.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">
                        {format(new Date(loan.borrowDate), "dd MMM yyyy", {
                          locale: enUS,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">
                        {format(new Date(loan.returnDate), "dd MMM yyyy", {
                          locale: enUS,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {loan.actualReturnDate ? (
                        <div className="text-sm text-green-700 font-medium">
                          {format(
                            new Date(loan.actualReturnDate),
                            "dd MMM yyyy",
                            { locale: enUS }
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Not returned
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {loan.status === "RETURNED" && (
                        <Badge
                          color="blue"
                          className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-sm font-semibold"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          Returned
                        </Badge>
                      )}
                      {loan.status === "VERIFIED_RETURNED" && (
                        <Badge
                          color="green"
                          className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm font-semibold"
                        >
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm text-gray-600">
                        {loan.notes || "No notes available"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 sm:gap-3">
                        {loan.status === "RETURNED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-sm sm:text-base px-3 sm:px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-300 transition-all duration-200"
                            onClick={() => openConfirmDialog(loan)}
                          >
                            <CheckCheck className="h-4 w-4 mr-1 sm:mr-2" />
                            Verify
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-sm sm:text-base px-3 sm:px-4 py-2 bg-gray-50 text-gray-500 border-gray-300"
                            disabled
                          >
                            <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                            Verified
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {/* ENHANCED VERIFICATION DIALOG */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Verify Return
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to verify this book return?
            </DialogDescription>
          </DialogHeader>

          {/* Return info in verification dialog */}
          {selectedLoan && (
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="h-16 w-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                {selectedLoan.book.coverImage ? (
                  <img
                    src={selectedLoan.book.coverImage}
                    alt={selectedLoan.book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-green-900 line-clamp-2 text-sm mb-1">
                  {selectedLoan.book.title}
                </h4>
                <p className="text-xs text-green-700 mb-1">
                  by {selectedLoan.book.author}
                </p>
                <p className="text-xs text-green-700 mb-1">
                  Borrower: {selectedLoan.user.name}
                </p>
                <p className="text-xs text-green-600">
                  Returned:{" "}
                  {selectedLoan.actualReturnDate &&
                    format(
                      new Date(selectedLoan.actualReturnDate),
                      "dd MMM yyyy",
                      { locale: enUS }
                    )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
              disabled={isProcessing}
              size="lg"
              className="text-base px-6 py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedLoan && handleVerifyReturn(selectedLoan.id)
              }
              disabled={isProcessing}
              size="lg"
              className="text-base px-6 py-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Verify Return
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile hint */}
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
