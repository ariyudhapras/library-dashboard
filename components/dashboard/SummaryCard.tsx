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
  valueFormatter?: (value: number) => string | null
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
  colorClass = "text-accent-600 bg-accent-50 dark:bg-accent-950 dark:text-accent-400",
  valueFormatter
}: SummaryCardProps) {
  return (
    <div className="w-full rounded-lg bg-white dark:bg-primary-800 shadow-sm border border-primary-100 dark:border-primary-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <p className="text-sm md:text-base font-medium text-primary-600 dark:text-primary-400">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 md:h-10 w-24 md:w-32" />
            ) : (
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1e3a8a] dark:text-primary-50">
                {value === null ? "—" : valueFormatter ? valueFormatter(value) : value.toLocaleString()}
              </h3>
            )}
            {description && (
              <p className="text-xs md:text-sm text-primary-500 dark:text-primary-400">
                {description}
              </p>
            )}
            {trend && !loading && (
              <div className="flex items-center text-xs md:text-sm">
                <span
                  className={cn(
                    "font-semibold",
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
          <div className={cn("rounded-full p-2 md:p-3 self-start", colorClass)}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </div>
    </div>
  )
} 