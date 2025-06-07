"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  User,
  Mail,
} from "lucide-react";
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
    profileImage?: string | null;
  };
};

// Enhanced Avatar Component with Real Photo Support
interface UserAvatarProps {
  user: BookLoan["user"];
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ user, size = "md" }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
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
              parent.innerHTML = `
                <div class="${
                  sizeClasses[size]
                } bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <span class="text-white font-bold">${getInitials(
                    user.name
                  )}</span>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  // If no profileImage, show initials with consistent styling
  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0 border-2 border-white`}
    >
      <span className="text-white font-bold">{getInitials(user.name)}</span>
    </div>
  );
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full";

    switch (status) {
      case "PENDING":
        return (
          <Badge
            className={`${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`}
          >
            Menunggu
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            className={`${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`}
          >
            Disetujui
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            className={`${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`}
          >
            Ditolak
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge
            className={`${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`}
          >
            Dikembalikan
          </Badge>
        );
      case "LATE":
        return (
          <Badge
            className={`${baseClasses} bg-purple-100 text-purple-800 hover:bg-purple-200`}
          >
            Terlambat
          </Badge>
        );
      default:
        return <Badge className={baseClasses}>{status}</Badge>;
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      {/* ENHANCED HEADER - Matching User Style */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight">
            Loan Requests
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2">
            Manage and process book loan requests from library members.
          </p>
        </div>
      </div>

      {/* ENHANCED TABS SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
        <Tabs
          defaultValue="PENDING"
          className="w-full"
          onValueChange={setActiveTab}
        >
          {/* ENLARGED TABS */}
          <TabsList className="mb-6 bg-gray-100 p-2 rounded-xl h-auto">
            <TabsTrigger
              value="ALL"
              className="text-base font-semibold px-6 py-3 rounded-lg"
            >
              All Requests
            </TabsTrigger>
            <TabsTrigger
              value="PENDING"
              className="text-base font-semibold px-6 py-3 rounded-lg"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="APPROVED"
              className="text-base font-semibold px-6 py-3 rounded-lg"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="REJECTED"
              className="text-base font-semibold px-6 py-3 rounded-lg"
            >
              Rejected
            </TabsTrigger>
            <TabsTrigger
              value="RETURNED"
              className="text-base font-semibold px-6 py-3 rounded-lg"
            >
              Returned
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* ENHANCED TABLE WITH BETTER STYLING */}
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-white">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-lg text-gray-600">
                      Loading loan requests...
                    </p>
                  </div>
                </div>
              ) : filteredLoans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-16 w-16 text-gray-400 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Loan Requests Found
                  </h3>
                  <p className="text-base text-gray-600">
                    No loan requests match the current filter.
                  </p>
                </div>
              ) : (
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
                        Loan Period
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Status
                      </TableHead>
                      <TableHead className="text-right font-semibold text-gray-900">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoans.map((loan) => (
                      <TableRow
                        key={loan.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          {/* ENHANCED BOOK DETAILS - Matching User Style */}
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="h-16 w-12 sm:h-20 sm:w-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                              {loan.book.coverImage ? (
                                <img
                                  src={loan.book.coverImage}
                                  alt={loan.book.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 mb-1">
                                {loan.book.title}
                              </h4>
                              <p className="text-sm sm:text-base text-gray-600">
                                by {loan.book.author}
                              </p>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                <span>Stock: {loan.book.stock}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* ENHANCED BORROWER INFO WITH AVATAR */}
                          <div className="flex items-center gap-3">
                            <UserAvatar user={loan.user} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900">
                                {loan.user.name}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">
                                  {loan.user.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">
                                {format(
                                  new Date(loan.borrowDate),
                                  "d MMM yyyy",
                                  { locale: id }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">
                                {format(
                                  new Date(loan.returnDate),
                                  "d MMM yyyy",
                                  { locale: id }
                                )}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell className="text-right">
                          {loan.status === "PENDING" && (
                            <div className="flex justify-end gap-2 sm:gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-sm px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 transition-all duration-200"
                                onClick={() =>
                                  openConfirmDialog(loan, "approve", "APPROVED")
                                }
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-sm px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 transition-all duration-200"
                                onClick={() =>
                                  openConfirmDialog(loan, "reject", "REJECTED")
                                }
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {loan.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm px-4 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              onClick={() =>
                                openConfirmDialog(loan, "return", "RETURNED")
                              }
                            >
                              Mark as Returned
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ENHANCED CONFIRMATION DIALOG */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {confirmDialog.action === "approve" && "Approve Loan Request"}
              {confirmDialog.action === "reject" && "Reject Loan Request"}
              {confirmDialog.action === "return" && "Confirm Book Return"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {confirmDialog.action === "approve" &&
                "Are you sure you want to approve this loan request?"}
              {confirmDialog.action === "reject" &&
                "Are you sure you want to reject this loan request?"}
              {confirmDialog.action === "return" &&
                "Are you sure this book has been returned?"}
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="py-4">
              {/* Enhanced loan preview */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="h-16 w-12 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  {selectedLoan.book.coverImage ? (
                    <img
                      src={selectedLoan.book.coverImage}
                      alt={selectedLoan.book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {selectedLoan.book.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    by {selectedLoan.book.author}
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <UserAvatar user={selectedLoan.user} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedLoan.user.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedLoan.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      Period:{" "}
                      {format(new Date(selectedLoan.borrowDate), "d MMM yyyy", {
                        locale: id,
                      })}{" "}
                      -{" "}
                      {format(new Date(selectedLoan.returnDate), "d MMM yyyy", {
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock warning */}
              {confirmDialog.action === "approve" &&
                selectedLoan.book.stock <= 0 && (
                  <div className="flex items-center gap-3 p-4 mt-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Low Stock Warning</p>
                      <p className="text-sm">
                        This book is out of stock. Approving this loan may
                        result in negative inventory.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, action: "", status: "" })
              }
              size="lg"
              className="text-base px-6 py-3"
            >
              Cancel
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
                  {confirmDialog.action === "approve" && "Approve Request"}
                  {confirmDialog.action === "reject" && "Reject Request"}
                  {confirmDialog.action === "return" && "Confirm Return"}
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
