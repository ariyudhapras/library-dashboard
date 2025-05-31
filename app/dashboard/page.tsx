import Dashboard from "@/components/dashboard"
import { PageHeader } from "@/components/page-header"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full">
      <PageHeader 
        title="Dashboard" 
        description="Ringkasan dan statistik perpustakaan digital" 
        showAddButton={false} 
        className="px-4 md:px-6"
      />
      <div className="w-full px-4 md:px-6">
        <Dashboard />
      </div>
    </div>
  )
}
