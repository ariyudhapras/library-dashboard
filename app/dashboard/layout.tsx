import { AuthGuard } from "@/components/AuthGuard"
import { SessionWrapper } from "@/components/SessionWrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionWrapper>
      <AuthGuard>
        <div className="container mx-auto py-6">
          {children}
        </div>
      </AuthGuard>
    </SessionWrapper>
  )
} 