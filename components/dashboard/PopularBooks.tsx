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
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-center">
              <div className="w-44 space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
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
          No Popular Books Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Be the first to borrow books from our collection!
        </p>
      </div>
    );
  }

  // Hanya tampilkan 3 buku populer teratas
  const topBooks = books.slice(0, 3);

  return (
    <div className="flex justify-center w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {topBooks.map((book, i) => (
          <div key={book.id} className="flex justify-center">
            <PopularBookCard
              book={book}
              rank={i + 1}
              onClick={() => onBookClick?.(book)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
