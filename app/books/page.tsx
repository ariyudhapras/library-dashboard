import BookDataTable from "@/components/book-data-table"
import { PageHeader } from "@/components/page-header"

export default function BooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Data Buku" description="Kelola data buku perpustakaan digital" />
      <BookDataTable />
    </div>
  )
}
