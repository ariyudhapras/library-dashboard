import ReturnDataTable from "@/components/return-data-table"
import { PageHeader } from "@/components/page-header"

export default function ReturnsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pengembalian Buku"
        description="Kelola pengembalian buku perpustakaan digital"
        showAddButton={false}
      />
      <ReturnDataTable />
    </div>
  )
}
