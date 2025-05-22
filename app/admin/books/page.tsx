import { PageHeader } from "@/components/page-header"
import BookDataTable from "@/components/book-data-table"

export default function AdminBooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Manajemen Buku" 
        description="Tambah, edit, dan hapus buku dalam koleksi perpustakaan" 
        showAddButton={false} 
      />
      
      <BookDataTable />
    </div>
  )
} 