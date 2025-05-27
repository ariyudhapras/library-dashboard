import { format, isValid, parseISO } from "date-fns"
import { Book, Check, Clock, X, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/design-tokens"

interface Activity {
  id: number
  type: "borrow" | "return" | "request" | "reject" | string // string agar fleksibel
  memberName: string
  bookTitle: string
  timestamp: string
}

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

const activityIcons = {
  borrow: Book,
  return: Check,
  request: Clock,
  reject: X,
}

const activityColors = {
  borrow: "text-accent-600 bg-accent-50 dark:bg-accent-950 dark:text-accent-400",
  return: "text-success-600 bg-success-50 dark:bg-success-950 dark:text-success-400",
  request: "text-warning-600 bg-warning-50 dark:bg-warning-950 dark:text-warning-400",
  reject: "text-error-600 bg-error-50 dark:bg-error-950 dark:text-error-400",
}

const activityLabels = {
  borrow: "Borrowed",
  return: "Returned",
  request: "Requested",
  reject: "Rejected",
}

// Utility function to safely format dates
const formatDate = (timestamp: string | undefined | null): string => {
  if (!timestamp) return "N/A"
  
  try {
    const date = parseISO(timestamp)
    if (!isValid(date)) return "Invalid Date"
    return format(date, "MMM d, h:mm a")
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-primary-200 dark:border-primary-700">
        <p className="text-sm text-primary-500 dark:text-primary-400">
          No recent activities
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = activityIcons[activity.type as keyof typeof activityIcons]
        let iconToRender = IconComponent
        let iconClass = cn("h-5 w-5")
        let wrapperClass = cn("rounded-full p-2", activityColors[activity.type as keyof typeof activityColors])
        if (!IconComponent) {
          console.warn(`Unknown activity.type '${activity.type}' for activity.id ${activity.id}`)
          iconToRender = AlertCircle
          iconClass = cn("h-5 w-5 text-error-700 dark:text-error-300 animate-pulse")
          wrapperClass = cn("rounded-full p-2 border-2 border-error-500 bg-error-50 dark:bg-error-950")
        }
        return (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={wrapperClass}>
              {iconToRender && <IconComponentOrFallback Icon={iconToRender} className={iconClass} />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary-900 dark:text-primary-50">
                {activity.memberName}
              </p>
              <div className="flex items-center gap-2 text-xs text-primary-500 dark:text-primary-400">
                <span>{activityLabels[activity.type as keyof typeof activityLabels] || activity.type}</span>
                <span>•</span>
                <span>{activity.bookTitle}</span>
                <span>•</span>
                <time dateTime={activity.timestamp || undefined}>
                  {formatDate(activity.timestamp)}
                </time>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Tambahkan komponen pembungkus agar iconToRender bisa dipanggil sebagai komponen React
function IconComponentOrFallback({ Icon, className }: { Icon: React.ComponentType<{ className?: string }>, className?: string }) {
  return <Icon className={className} />
} 