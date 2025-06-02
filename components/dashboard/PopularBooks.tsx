import { Book } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/design-tokens";
import PopularBookCard from "./PopularBookCard";

interface Book {
  id: number;
  title: string;
  author: string;
  borrowCount: number;
  coverImage?: string | null;
}

interface PopularBooksProps {
  books: Book[];
  loading?: boolean;
  onBookClick?: (book: Book) => void;
}

export function PopularBooks({
  books,
  loading = false,
  onBookClick,
}: PopularBooksProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!books?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
          <Book className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Belum ada buku populer
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Jadilah yang pertama meminjam buku dari koleksi kami!
        </p>
      </div>
    );
  }

  // Hanya tampilkan 3 buku populer
  const topBooks = books.slice(0, 3);
  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Desktop grid, 3 kolom, card besar */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {topBooks.map((book, i) => (
          <div className="flex justify-center" key={book.id}>
            <PopularBookCard
              book={book}
              rank={i + 1}
              large
              cardWidth="w-56 md:w-72"
            />
          </div>
        ))}
      </div>
      {/* Mobile: card rata tengah, lebar fit container, hanya 3 buku */}
      <div className="flex md:hidden flex-col items-center gap-6 px-4 pb-2">
        {topBooks.map((book, i) => (
          <div className="w-full max-w-sm" key={book.id}>
            <PopularBookCard
              book={book}
              rank={i + 1}
              large
              cardWidth="w-full max-w-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
