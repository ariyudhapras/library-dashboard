import { ReactNode } from "react"
import { cn } from "@/lib/design-tokens"

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-primary-50 dark:bg-primary-900", className)}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:gap-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export function DashboardSection({ children, className }: DashboardLayoutProps) {
  return (
    <section className={cn("rounded-lg bg-white dark:bg-primary-800 shadow-sm border border-primary-100 dark:border-primary-700", className)}>
      {children}
    </section>
  )
}

export function DashboardHeader({ children, className }: DashboardLayoutProps) {
  return (
    <header className={cn("px-6 py-4 border-b border-primary-100 dark:border-primary-700", className)}>
      {children}
    </header>
  )
}

export function DashboardContent({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

export function DashboardGrid({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {children}
    </div>
  )
}

export function DashboardCard({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("rounded-lg bg-white dark:bg-primary-800 shadow-sm border border-primary-100 dark:border-primary-700 p-6", className)}>
      {children}
    </div>
  )
} 