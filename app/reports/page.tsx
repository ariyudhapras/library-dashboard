import ReportViewer from "@/components/report-viewer"
import { PageHeader } from "@/components/page-header"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Laporan" description="Lihat dan cetak laporan perpustakaan digital" showAddButton={false} />
      <ReportViewer />
    </div>
  )
}
