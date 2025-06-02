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
  isWishlisted?: boolean;
}

export function BookCard({
  book,
  onRequestLoan,
  isWishlisted = false,
}: BookCardProps) {
  const { data: session } = useSession();
  const [isAlreadyBorrowed, setIsAlreadyBorrowed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if book is new (published in 2024 or later)
  const isNew = book.year && book.year >= 2024;

  // Check if book is popular (more than 10 borrows)
  const isPopular = book.borrowCount && book.borrowCount > 10;

  // Check if book is low in stock (less than 3)
  const isLowStock = book.stock > 0 && book.stock < 3;

  useEffect(() => {
    const checkIfBorrowed = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/bookloans?userId=${session.user.id}`
        );
        if (!response.ok) return;

        const loans = await response.json();

        // Check if any active loan exists for this book
        const borrowed = loans.some(
          (loan: any) =>
            loan.bookId === book.id &&
            (loan.status === "PENDING" || loan.status === "APPROVED")
        );

        setIsAlreadyBorrowed(borrowed);
      } catch (error) {
        console.error("Error checking book status:", error);
      }
    };

    if (session?.user?.id) {
      checkIfBorrowed();
    }
  }, [book.id, session]);

  const handleRequestLoan = async () => {
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

      <CardFooter className="p-4 flex flex-row gap-2">
        <Button
          onClick={handleRequestLoan}
          className="flex-1"
          disabled={book.stock === 0 || isLoading || isAlreadyBorrowed}
          aria-label={
            book.stock > 0 ? "Ajukan peminjaman buku" : "Stok buku habis"
          }
        >
          {isLoading ? (
            <>
              <Loader2
                className="h-4 w-4 mr-2 animate-spin"
                aria-hidden="true"
              />
              <span>Memproses...</span>
            </>
          ) : isAlreadyBorrowed ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Sudah Dipinjam</span>
            </>
          ) : (
            "Ajukan Pinjam"
          )}
        </Button>

        {session?.user && (
          <WishlistConfirmButton
            bookId={book.id}
            className="w-10 h-10"
            initialIsWishlisted={isWishlisted}
            aria-label={
              isWishlisted ? "Hapus dari Wishlist" : "Tambah ke Wishlist"
            }
          />
        )}
      </CardFooter>
    </Card>
  );
}
