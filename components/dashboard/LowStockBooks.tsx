import { AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/design-tokens"

interface Book {
  id: number
  title: string
  author: string
  stock: number
  minStock: number
}

interface LowStockBooksProps {
  books: Book[]
  loading?: boolean
}

export function LowStockBooks({ books, loading = false }: LowStockBooksProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
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
          No low stock books
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <div key={book.id} className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning-50 dark:bg-warning-950">
            <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-medium text-primary-900 dark:text-primary-50">
              {book.title}
            </h3>
            <p className="text-xs text-primary-500 dark:text-primary-400">
              {book.author}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-sm font-medium",
              book.stock === 0
                ? "text-error-600 dark:text-error-400"
                : "text-warning-600 dark:text-warning-400"
            )}>
              {book.stock}
            </span>
            <span className="text-xs text-primary-500 dark:text-primary-400">
              in stock
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 