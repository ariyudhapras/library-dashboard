import MemberDataTable from "@/components/member-data-table"
import { PageHeader } from "@/components/page-header"

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Anggota"
        description="Kelola data anggota perpustakaan digital"
        addButtonLabel="Tambah Anggota"
      />
      <MemberDataTable />
    </div>
  )
}
