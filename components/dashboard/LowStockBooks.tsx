import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PartyPopper, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Book {
  id: number
  title: string
  author: string
  stock: number
  coverImage: string | null
}

interface LowStockBooksProps {
  books: Book[]
  loading?: boolean
}

export function LowStockBooks({ books, loading = false }: LowStockBooksProps) {
  // Render skeleton loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stok Buku Menipis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stok Buku Menipis</CardTitle>
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <Alert>
            <PartyPopper className="h-4 w-4" />
            <AlertTitle>Semua buku memiliki stok yang mencukupi</AlertTitle>
            <AlertDescription>
              Tidak ada buku yang stoknya di bawah 5.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <Alert key={book.id} variant="destructive" className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex flex-1 flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <AlertTitle className="text-sm font-medium">
                      <Link href={`/admin/books/edit/${book.id}`} className="hover:underline">
                        {book.title}
                      </Link>
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      {book.author}
                    </AlertDescription>
                  </div>
                  <Badge variant="outline" className="self-start sm:self-center border-yellow-500 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300">
                    {book.stock} tersisa
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 