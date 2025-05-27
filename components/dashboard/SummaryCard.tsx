import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/design-tokens"
import { Skeleton } from "@/components/ui/skeleton"

interface SummaryCardProps {
  title: string
  value: number | null
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  loading?: boolean
  colorClass?: string
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
  colorClass = "text-accent-600 bg-accent-50 dark:bg-accent-950 dark:text-accent-400"
}: SummaryCardProps) {
  return (
    <div className="rounded-lg bg-white dark:bg-primary-800 shadow-sm border border-primary-100 dark:border-primary-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <h3 className="text-2xl font-semibold tracking-tight text-primary-900 dark:text-primary-50">
                {value === null ? "—" : value.toLocaleString()}
              </h3>
            )}
            {description && (
              <p className="text-xs text-primary-500 dark:text-primary-400">
                {description}
              </p>
            )}
            {trend && !loading && (
              <div className="flex items-center text-xs">
                <span
                  className={cn(
                    "font-medium",
                    trend.isPositive
                      ? "text-success-600 dark:text-success-400"
                      : "text-error-600 dark:text-error-400"
                  )}
                >
                  {trend.isPositive ? "+" : "−"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="ml-1 text-primary-500 dark:text-primary-400">
                  from last month
                </span>
              </div>
            )}
          </div>
          <div className={cn("rounded-full p-2", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
} 