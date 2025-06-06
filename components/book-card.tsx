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
  onRequestLoan: (book: Book) => void;
  isBorrowed: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (bookId: number) => void;
}

export function BookCard({
  book,
  onRequestLoan,
  isBorrowed,
  isWishlisted,
  onToggleWishlist,
}: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Check if book is new (published in 2024 or later)
  const isNew = book.year && book.year >= 2024;

  // Check if book is popular (more than 10 borrows)
  const isPopular = book.borrowCount && book.borrowCount > 10;

  // Check if book is low in stock (less than 3)
  const isLowStock = book.stock > 0 && book.stock < 3;

  // Loan request handler, blocks if already borrowed
  const handleRequestLoan = async () => {
    if (isBorrowed || book.stock === 0) return;
    setIsLoading(true);
    try {
      await onRequestLoan(book);
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
            alt={`Sampul buku ${book.title}`}
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
            aria-label="Tidak ada sampul buku"
          >
            <ImageIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {/* Badges with animation */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && (
            <Badge
              className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
              aria-label="Buku baru"
            >
              Baru
            </Badge>
          )}
          {isPopular && (
            <Badge
              className="bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200"
              aria-label="Buku populer"
            >
              Populer
            </Badge>
          )}
          {isLowStock && (
            <Badge
              className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              aria-label="Stok terbatas"
            >
              Segera Habis
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4">
        <CardTitle
          id={`book-title-${book.id}`}
          className="line-clamp-2 text-lg min-h-[3rem]"
        >
          {book.title}
        </CardTitle>

        <p className="text-sm text-muted-foreground">Karya: {book.author}</p>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {book.category && (
            <Badge
              className="bg-blue-100 text-blue-800 transition-colors duration-200"
              aria-label={`Kategori: ${book.category}`}
            >
              {book.category}
            </Badge>
          )}
          {book.year && (
            <Badge
              className="transition-colors duration-200"
              aria-label={`Tahun terbit: ${book.year}`}
            >
              {book.year}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm">
          <span className="font-medium">Stok:</span>{" "}
          <span aria-label={`Stok tersedia: ${book.stock} buku`}>
            {book.stock}
          </span>
        </p>
      </CardContent>

      {/* Responsive CardFooter: Desktop (row), Mobile (column, wishlist below or corner) */}
      <CardFooter className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full gap-2">
          <Button
            onClick={handleRequestLoan}
            className={
              `w-full text-sm py-2 rounded-md sm:flex-1 sm:py-2 flex items-center justify-center gap-2` +
              (isBorrowed ? ' bg-gray-200 text-gray-600 cursor-not-allowed opacity-90' : '')
            }
            disabled={book.stock === 0 || isLoading || isBorrowed}
            aria-label={
              book.stock === 0
                ? "Stok buku habis"
                : isBorrowed
                ? "Already Borrowed"
                : "Ajukan peminjaman buku"
            }
            tabIndex={book.stock === 0 || isLoading || isBorrowed ? -1 : 0}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                <span>Memproses...</span>
              </>
            ) : isBorrowed ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Already Borrowed</span>
              </>
            ) : (
              "Ajukan Pinjam"
            )}
          </Button>

          {/* Desktop: Wishlist button next to loan button */}
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={() => onToggleWishlist(book.id)}
            className={
              `hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 ml-1` +
              (isWishlisted ? " text-blue-600" : " text-gray-400")
            }
          >
            {isWishlisted ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            )}
          </button>
        </div>

        {/* Mobile: Wishlist button below loan button or at bottom right */}
        <div className="flex justify-end sm:hidden mt-2">
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={() => onToggleWishlist(book.id)}
            className={
              `w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400` +
              (isWishlisted ? " text-blue-600" : " text-gray-400")
            }
          >
            {isWishlisted ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            )}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
