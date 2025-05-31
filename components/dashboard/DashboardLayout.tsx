import { ReactNode } from "react"
import { cn } from "@/lib/design-tokens"

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen w-full bg-gray-100 dark:bg-primary-900", className)}>
      <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 xl:px-12 py-8">
        <div className="grid gap-8 md:gap-10 lg:gap-12">
          {children}
        </div>
      </div>
    </div>
  )
}

export function DashboardSection({ children, className }: DashboardLayoutProps) {
  return (
    <section className={cn("w-full rounded-lg bg-white dark:bg-primary-800 shadow-sm border border-primary-100 dark:border-primary-700 mb-4 md:mb-6 last:mb-0", className)}>
      {children}
    </section>
  )
}

export function DashboardHeader({ children, className }: DashboardLayoutProps) {
  return (
    <header className={cn("w-full px-4 md:px-6 py-3 md:py-4 border-b border-primary-100 dark:border-primary-700 bg-gray-50 dark:bg-primary-900/50", className)}>
      {children}
    </header>
  )
}

export function DashboardContent({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("w-full p-4 md:p-6 bg-white dark:bg-primary-800", className)}>
      {children}
    </div>
  )
}

export function DashboardGrid({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {children}
    </div>
  )
}

export function DashboardCard({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("w-full rounded-lg bg-white dark:bg-primary-800 shadow-sm border border-primary-100 dark:border-primary-700 p-4 md:p-6", className)}>
      {children}
    </div>
  )
} 