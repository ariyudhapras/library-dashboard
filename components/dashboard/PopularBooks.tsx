import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

interface Book {
  id: number
  title: string
  author: string
  stock: number
  coverImage: string | null
  _count: {
    bookLoans: number
  }
}

interface PopularBooksProps {
  books: Book[]
  loading?: boolean
}

export function PopularBooks({ books, loading = false }: PopularBooksProps) {
  const getAuthorInitials = (author: string) => {
    return author
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  // Render skeleton loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Buku Populer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buku Populer</CardTitle>
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Belum ada data peminjaman</p>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={book.coverImage || ""} alt={book.title} />
                  <AvatarFallback className="rounded-md bg-primary font-medium text-primary-foreground">
                    {getAuthorInitials(book.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/admin/books/edit/${book.id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {book.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{book.author}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{book._count.bookLoans}</span>
                  <span className="text-xs text-muted-foreground">peminjaman</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 