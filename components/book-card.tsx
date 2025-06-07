import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WishlistConfirmButton } from "@/components/wishlist-confirm-button";

export type Book = {
  id: number;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  isbn: string | null;
  stock: number;
  category: string | null;
  coverImage: string | null;
  borrowCount?: number;
};

interface BookCardProps {
  book: Book;
  onRequestLoan: (book: Book) => Promise<void> | void; // Support both sync and async
  isBorrowed: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (bookId: number) => void;
  onLoanSuccess?: (bookId: number) => void; // Optional callback for successful loan
}

export function BookCard({
  book,
  onRequestLoan,
  isBorrowed,
  isWishlisted,
  onToggleWishlist,
  onLoanSuccess,
}: BookCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localIsBorrowed, setLocalIsBorrowed] = useState<boolean>(isBorrowed);
  const [isOptimisticallyBorrowed, setIsOptimisticallyBorrowed] =
    useState<boolean>(false);

  // Sync local state with prop using optimistic update pattern
  useEffect(() => {
    // Always sync with prop if it becomes true (server confirmation)
    if (isBorrowed) {
      setLocalIsBorrowed(true);
      setIsOptimisticallyBorrowed(false); // Reset optimistic flag - server confirmed
    }
    // Only sync with false if we're not in optimistic state
    // This prevents resetting optimistic updates when other components re-render
    else if (!isOptimisticallyBorrowed) {
      setLocalIsBorrowed(false);
    }
  }, [isBorrowed, isOptimisticallyBorrowed]);

  // Check if book is new (published in 2024 or later)
  const isNew: boolean = Boolean(book.year && book.year >= 2024);

  // Check if book is popular (more than 10 borrows)
  const isPopular: boolean = Boolean(book.borrowCount && book.borrowCount > 10);

  // Check if book is low in stock (less than 3)
  const isLowStock: boolean = book.stock > 0 && book.stock < 3;

  // Loan request handler with optimistic update
  const handleRequestLoan = async (): Promise<void> => {
    if (localIsBorrowed || book.stock === 0) return;

    setIsLoading(true);
    try {
      const result = onRequestLoan(book);

      // Handle both sync and async onRequestLoan
      if (result instanceof Promise) {
        await result;
      }

      // Optimistic update - set borrowed state immediately
      setLocalIsBorrowed(true);
      setIsOptimisticallyBorrowed(true); // Mark as optimistic update

      // Call success callback if provided
      if (onLoanSuccess) {
        onLoanSuccess(book.id);
      }
    } catch (error) {
      // If error occurs, revert the optimistic update
      setLocalIsBorrowed(isBorrowed); // Revert to prop value
      setIsOptimisticallyBorrowed(false);
      console.error("Loan request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02]",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        "active:scale-[0.98]"
      )}
      role="article"
      aria-labelledby={`book-title-${book.id}`}
    >
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-slate-100">
        {/* Book Cover */}
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            quality={85}
            priority={false}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            role="img"
            aria-label="No book cover available"
          >
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {/* Badges with animation */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <Badge
              className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 text-base font-semibold px-3 py-1"
              aria-label="New book"
            >
              New
            </Badge>
          )}
          {isPopular && (
            <Badge
              className="bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200 text-base font-semibold px-3 py-1"
              aria-label="Popular book"
            >
              Popular
            </Badge>
          )}
          {isLowStock && (
            <Badge
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 text-base font-semibold px-3 py-1"
              aria-label="Limited stock"
            >
              Low Stock
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4">
        <CardTitle
          id={`book-title-${book.id}`}
          className="line-clamp-2 text-xl font-bold min-h-[3rem]"
        >
          {book.title}
        </CardTitle>

        <p className="text-lg text-muted-foreground font-semibold">
          Author: {book.author}
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {book.category && (
            <Badge
              className="bg-blue-100 text-blue-800 transition-colors duration-200 text-base font-semibold px-3 py-1"
              aria-label={`Category: ${book.category}`}
            >
              {book.category}
            </Badge>
          )}
          {book.year && (
            <Badge
              className="transition-colors duration-200 text-base font-semibold px-3 py-1"
              aria-label={`Published year: ${book.year}`}
            >
              Years: {book.year}
            </Badge>
          )}
        </div>
        <p className="mt-3 text-lg">
          <span className="font-bold">Stock:</span>{" "}
          <span
            className="font-semibold text-lg"
            aria-label={`Available stock: ${book.stock} books`}
          >
            {book.stock}
          </span>
        </p>
      </CardContent>

      {/* Fixed CardFooter Layout - Conditional wishlist */}
      <CardFooter className="p-4">
        <div className="flex w-full items-center gap-3">
          {/* Main Button - Full width if borrowed, flex-1 if not borrowed */}
          <div className={localIsBorrowed ? "w-full" : "flex-1"}>
            <Button
              onClick={handleRequestLoan}
              className={cn(
                "w-full h-10 flex items-center justify-center gap-2 transition-all duration-200",
                localIsBorrowed
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed hover:bg-gray-200"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              disabled={book.stock === 0 || isLoading || localIsBorrowed}
              aria-label={
                book.stock === 0
                  ? "Out of stock"
                  : localIsBorrowed
                  ? "Already borrowed"
                  : "Request loan for this book"
              }
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">Processing...</span>
                </>
              ) : localIsBorrowed ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Already Borrowed</span>
                </>
              ) : book.stock === 0 ? (
                <span className="text-sm font-medium">Out of Stock</span>
              ) : (
                <span className="text-sm font-medium">Request Loan</span>
              )}
            </Button>
          </div>

          {/* Wishlist Button - Only show if not borrowed */}
          {!localIsBorrowed && (
            <div className="flex-shrink-0">
              <button
                type="button"
                aria-label={
                  isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                }
                onClick={() => onToggleWishlist(book.id)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                  "hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  isWishlisted ? "text-blue-600" : "text-gray-400"
                )}
              >
                {isWishlisted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
