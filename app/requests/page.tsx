import RequestDataTable from "@/components/request-data-table"
import { PageHeader } from "@/components/page-header"

export default function RequestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pengajuan Peminjaman"
        description="Kelola pengajuan peminjaman buku perpustakaan digital"
        showAddButton={false}
      />
      <RequestDataTable />
    </div>
  )
}
