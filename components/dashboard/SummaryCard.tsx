import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
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
  colorClass = "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400"
}: SummaryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start p-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="mt-2 h-7 w-16" />
            ) : (
              <h3 className="mt-2 text-2xl font-bold tracking-tight">
                {value === null ? "Tidak ada data" : value.toLocaleString()}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
            {trend && !loading && (
              <div className="mt-1 flex items-center text-xs">
                <span
                  className={
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }
                >
                  {trend.isPositive ? "+" : "-"}
                  {trend.value}%
                </span>
                <span className="ml-1 text-muted-foreground">dari bulan lalu</span>
              </div>
            )}
          </div>
          <div className={`rounded-full p-2 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 