import { Book } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/design-tokens"

interface Book {
  id: number
  title: string
  author: string
  borrowCount: number
  coverImage?: string | null
}

interface PopularBooksProps {
  books: Book[]
  loading?: boolean
  onBookClick?: (book: Book) => void
}

export function PopularBooks({ books, loading = false, onBookClick }: PopularBooksProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-primary-200 dark:border-primary-700">
        <p className="text-sm text-primary-500 dark:text-primary-400">
          No popular books data available
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <div
          key={book.id}
          className={cn(
            "flex items-center gap-3 p-2 rounded-md bg-white shadow-sm border border-slate-100",
            onBookClick && "cursor-pointer hover:bg-slate-100 transition"
          )}
          tabIndex={onBookClick ? 0 : undefined}
          role={onBookClick ? "button" : undefined}
          aria-label={book.title}
          onClick={onBookClick ? () => onBookClick(book) : undefined}
          onKeyDown={onBookClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onBookClick(book) } : undefined}
        >
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-800 overflow-hidden">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <Book className="h-6 w-6 text-primary-500 dark:text-primary-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-primary-900 dark:text-primary-50 truncate">
              {book.title}
            </h3>
            <p className="text-xs text-primary-500 dark:text-primary-400 truncate">
              {book.author}
            </p>
          </div>
          <div className="flex flex-col items-end min-w-fit pl-2">
            <span className="text-sm font-medium text-primary-900 dark:text-primary-50">
              {book.borrowCount}
            </span>
            <span className="text-xs text-primary-500 dark:text-primary-400 leading-tight">
              loans
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 