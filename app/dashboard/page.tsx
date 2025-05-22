import Dashboard from "@/components/dashboard"
import { PageHeader } from "@/components/page-header"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Ringkasan dan statistik perpustakaan digital" showAddButton={false} />
      <Dashboard />
    </div>
  )
}
