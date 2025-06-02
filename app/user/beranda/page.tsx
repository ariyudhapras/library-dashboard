"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  Book,
  ClockIcon,
  BookMarked,
  CircleCheck,
  CircleX,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  Heart,
  CheckCircle,
  Coins,
} from "lucide-react";
import Link from "next/link";
import {
  DashboardLayout,
  DashboardSection,
  DashboardHeader,
  DashboardContent,
  DashboardGrid,
} from "@/components/dashboard/DashboardLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { PopularBooks } from "@/components/dashboard/PopularBooks";
import RequestLoanDialog from "@/components/RequestLoanDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarDropdown } from "@/components/ui/AvatarDropdown";

// Book loan summary type
type LoanSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  returned: number;
  late: number;
};

export default function BerandaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loanSummary, setLoanSummary] = useState<LoanSummary>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    returned: 0,
    late: 0,
  });
  const [totalFine, setTotalFine] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [bookLoans, setBookLoans] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchLoanSummary = async () => {
      if (!session?.user?.id) return;
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/bookloans?userId=${session.user.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch book loans");
        }
        const loans = await response.json();
        setBookLoans(loans);

        // Calculate total fine
        const fine = loans.reduce((total: number, loan: any) => {
          if (loan.status === "LATE" && loan.actualReturnDate) {
            const returnDate = new Date(loan.returnDate);
            const actualReturnDate = new Date(loan.actualReturnDate);
            const diffInDays = Math.ceil(
              (actualReturnDate.getTime() - returnDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return total + diffInDays * 5000; // Rp 5.000 per hari
          }
          return total;
        }, 0);
        setTotalFine(fine);

        const summary = {
          total: loans.length,
          pending: loans.filter((loan: any) => loan.status === "PENDING")
            .length,
          approved: loans.filter((loan: any) => loan.status === "APPROVED")
            .length,
          rejected: loans.filter((loan: any) => loan.status === "REJECTED")
            .length,
          returned: loans.filter((loan: any) => loan.status === "RETURNED")
            .length,
          late: loans.filter((loan: any) => loan.status === "LATE").length,
        };
        setLoanSummary(summary);
      } catch (error) {
        console.error("Error fetching loan summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user?.id) {
      fetchLoanSummary();
    }
  }, [session]);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setLoadingPopular(true);
        const res = await fetch("/api/books/popular");
        if (!res.ok) throw new Error("Failed to fetch popular books");
        const data = await res.json();
        setPopularBooks(data);
      } catch (err) {
        setPopularBooks([]);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularBooks();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) throw new Error("Failed to fetch wishlist");
        const data = await response.json();
        setWishlistCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setWishlistCount(0);
      }
    };
    if (session?.user?.id) {
      fetchWishlist();
    }
  }, [session]);

  const handleCardClick = (type: string) => {
    switch (type) {
      case "catalog":
        router.push("/user/katalog");
        break;
      case "activeLoans":
        router.push("/user/active-loans");
        break;
      case "history":
        router.push("/user/history");
        break;
      case "pinjamBaru":
        router.push("/user/katalog");
        break;
      case "approvedLoans":
        router.push("/user/active-loans?tab=APPROVED");
        break;
      case "pendingLoans":
        router.push("/user/active-loans?tab=PENDING");
        break;
    }
  };

  const handlePopularBookClick = (book: any) => {
    setSelectedBook(book);
    setIsRequestDialogOpen(true);
  };

  return (
    <DashboardLayout>
      {/* RESPONSIVE HEADER PERSONAL */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight">
            Welcome
            {session?.user?.name ? `, ${session.user.name}!` : "!"}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2">
            Overview of your library activities
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
          <div className="rounded-full border-2 sm:border-4 border-primary-500 p-0.5 sm:p-1 shadow">
            <AvatarDropdown />
          </div>
        </div>
      </div>

      {/* RESPONSIVE STAT CARDS */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 mb-4 sm:mb-6 w-full">
        {/* Borrowed Books Card */}
        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 flex justify-between items-center transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl active:scale-95"
          onClick={() => router.push("/user/active-loans?tab=APPROVED")}
          tabIndex={0}
          role="button"
          aria-label="See all borrowed books"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-500 mb-1 sm:mb-2 truncate">
              Borrowed Books
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {loanSummary.approved}
            </div>
          </div>
          <div className="bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-3 ml-2 sm:ml-3 flex-shrink-0">
            <Book className="w-5 h-5 sm:w-8 sm:h-8" />
          </div>
        </div>

        {/* Wishlist Card */}
        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 flex justify-between items-center transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl active:scale-95"
          onClick={() => router.push("/user/wishlist")}
          tabIndex={0}
          role="button"
          aria-label="See wishlist"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-500 mb-1 sm:mb-2 truncate">
              Wishlist
            </div>
            <div className="text-xl sm:text-2xl font-bold">{wishlistCount}</div>
          </div>
          <div className="bg-pink-100 text-pink-600 rounded-lg sm:rounded-xl p-2 sm:p-3 ml-2 sm:ml-3 flex-shrink-0">
            <Heart className="w-5 h-5 sm:w-8 sm:h-8" />
          </div>
        </div>

        {/* Books Read Card */}
        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 flex justify-between items-center transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl active:scale-95"
          onClick={() => router.push("/user/history")}
          tabIndex={0}
          role="button"
          aria-label="See books read"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-500 mb-1 sm:mb-2 truncate">
              Books Read
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {loanSummary.returned}
            </div>
          </div>
          <div className="bg-green-100 text-green-600 rounded-lg sm:rounded-xl p-2 sm:p-3 ml-2 sm:ml-3 flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8" />
          </div>
        </div>

        {/* Fine Card */}
        <div
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 flex justify-between items-center transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-2xl active:scale-95"
          onClick={() => router.push("/user/history")}
          tabIndex={0}
          role="button"
          aria-label="See fine details"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-500 mb-1 sm:mb-2 truncate">
              Fine
            </div>
            <div className="text-lg sm:text-2xl font-bold truncate">
              {totalFine > 0 ? `Rp ${totalFine.toLocaleString()}` : "Rp 0"}
            </div>
          </div>
          <div className="bg-yellow-100 text-yellow-600 rounded-lg sm:rounded-xl p-2 sm:p-3 ml-2 sm:ml-3 flex-shrink-0">
            <Coins className="w-5 h-5 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>

      {/* RESPONSIVE ACTIVE LOANS SECTION */}
      <DashboardSection>
        <DashboardHeader className="bg-gray-100 text-center rounded-t-lg sm:rounded-t-xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary-900 dark:text-primary-50 p-2 sm:p-2">
            Active Loans
          </h2>
        </DashboardHeader>
        <DashboardContent>
          <div className="p-2 sm:p-2">
            {bookLoans.filter((loan: any) =>
              ["APPROVED", "PENDING", "LATE"].includes(loan.status)
            ).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
                {bookLoans
                  .filter((loan: any) =>
                    ["APPROVED", "PENDING", "LATE"].includes(loan.status)
                  )
                  .slice(0, 3)
                  .map((loan: any) => (
                    <div
                      key={loan.id}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={loan.book.coverImage || "/book-placeholder.png"}
                          alt={loan.book.title}
                          className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg sm:rounded-xl shadow"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                          {(() => {
                            const today = new Date();
                            const returnDate = new Date(loan.returnDate);
                            const diffInDays = Math.ceil(
                              (returnDate.getTime() - today.getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            let badgeColor = "bg-green-100 text-green-700";
                            if (diffInDays <= 7)
                              badgeColor = "bg-yellow-100 text-yellow-700";
                            if (diffInDays <= 3)
                              badgeColor = "bg-red-100 text-red-700";
                            return diffInDays > 0 ? (
                              <span
                                className={`inline-block ${badgeColor} text-xs font-semibold rounded px-2 py-1`}
                              >
                                {diffInDays} days left
                              </span>
                            ) : null;
                          })()}

                          {loan.status === "LATE" && (
                            <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold rounded px-2 py-1">
                              Overdue
                            </span>
                          )}
                          {loan.status === "PENDING" && (
                            <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold rounded px-2 py-1">
                              Pending
                            </span>
                          )}
                          {loan.status === "APPROVED" && (
                            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold rounded px-2 py-1">
                              Approved
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base sm:text-lg lg:text-xl text-primary-900 line-clamp-2 mb-1">
                          {loan.book.title}
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-500 mb-2 line-clamp-1">
                          {loan.book.author}
                        </p>
                        <div className="flex flex-col gap-1 text-xs sm:text-sm lg:text-base text-gray-500 mt-2">
                          <span className="inline-flex items-center justify-center sm:justify-start gap-1">
                            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="truncate">
                              Due:{" "}
                              {new Date(loan.returnDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </span>
                          {loan.status === "LATE" && (
                            <span className="inline-flex items-center justify-center sm:justify-start gap-1 text-red-600 font-medium">
                              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                              <span className="truncate">
                                Denda:{" "}
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(
                                  Math.ceil(
                                    (new Date().getTime() -
                                      new Date(loan.returnDate).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  ) * 5000
                                )}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="text-gray-500 italic text-center">
                  <p className="text-lg sm:text-xl mb-2">No active loans</p>
                  <p className="text-sm sm:text-base">
                    Start borrowing books from our catalog!
                  </p>
                </div>
              </div>
            )}

            {/* View All button */}
            <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
              <Link
                href="/user/active-loans"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm sm:text-base hover:underline transition-colors px-4 py-2 sm:px-0 sm:py-0"
              >
                View All <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </DashboardContent>
      </DashboardSection>

      {/* RESPONSIVE RECENT HISTORY SECTION */}
      <DashboardSection>
        <DashboardHeader className="bg-gray-100 text-center rounded-t-lg sm:rounded-t-xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary-900 dark:text-primary-50 p-2 sm:p-2">
            Recent History
          </h2>
        </DashboardHeader>
        <DashboardContent>
          <div className="p-2 sm:p-2">
            {bookLoans.filter((loan: any) =>
              ["RETURNED", "REJECTED"].includes(loan.status)
            ).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
                {bookLoans
                  .filter((loan: any) =>
                    ["RETURNED", "REJECTED"].includes(loan.status)
                  )
                  .slice(0, 3)
                  .map((loan: any) => (
                    <div
                      key={loan.id}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={loan.book.coverImage || "/book-placeholder.png"}
                          alt={loan.book.title}
                          className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg sm:rounded-xl shadow"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="font-bold text-base sm:text-lg lg:text-xl text-primary-900 line-clamp-2 mb-1">
                          {loan.book.title}
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-500 line-clamp-1 mb-2">
                          {loan.book.author}
                        </p>
                        <div className="flex flex-col gap-1 text-xs sm:text-sm lg:text-base text-gray-500">
                          <span className="inline-flex items-center justify-center sm:justify-start gap-1">
                            📅
                            <span className="truncate">
                              Borrowed:{" "}
                              {new Date(loan.borrowDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </span>
                          <span className="inline-flex items-center justify-center sm:justify-start gap-1">
                            📅
                            <span className="truncate">
                              Returned:{" "}
                              {new Date(loan.returnDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </span>
                          <div className="flex justify-center sm:justify-start mt-2">
                            {loan.status === "RETURNED" && (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold rounded px-2 py-1">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                Returned
                              </span>
                            )}
                            {loan.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold rounded px-2 py-1">
                                <CircleX className="w-3 h-3 sm:w-4 sm:h-4" />
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <img
                  src="/empty-state.svg"
                  alt="No history"
                  className="w-32 h-32 sm:w-40 sm:h-40 mb-4"
                />
                <p className="text-gray-500 italic text-base sm:text-lg text-center px-4">
                  No loan history available.
                </p>
              </div>
            )}

            {/* View All button */}
            <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
              <Link
                href="/user/history"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm sm:text-base hover:underline transition-colors px-4 py-2 sm:px-0 sm:py-0"
              >
                View All <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </DashboardContent>
      </DashboardSection>

      {/* RESPONSIVE POPULAR BOOKS SECTION */}
      <DashboardSection>
        <DashboardHeader className="text-center bg-gray-100 rounded-t-lg sm:rounded-t-xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary-900 dark:text-primary-50 p-2 sm:p-2">
            Popular Books 🔥
          </h2>
        </DashboardHeader>
        <DashboardContent>
          <div className="p-2 sm:p-2">
            <PopularBooks books={popularBooks} loading={loadingPopular} />
          </div>
        </DashboardContent>
      </DashboardSection>

      {/* Modal Pinjam Buku dari Buku Populer */}
      <RequestLoanDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        book={selectedBook}
      />
    </DashboardLayout>
  );
}
