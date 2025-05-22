import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  CircleCheck, 
  CircleX, 
  Clock, 
  RotateCcw, 
  ShoppingBag,
  HelpCircle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Activity {
  id: number
  user: {
    id: number
    name: string
    email: string
  }
  book: {
    id: number
    title: string
    author: string
    coverImage: string | null
  }
  status: string
  updatedAt: string
}

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  // Function to get the appropriate icon based on loan status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CircleCheck className="h-5 w-5 text-green-500" />
      case "REJECTED":
        return <CircleX className="h-5 w-5 text-red-500" />
      case "PENDING":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "RETURNED":
        return <RotateCcw className="h-5 w-5 text-blue-500" />
      case "LATE":
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />
    }
  }

  // Function to get activity description based on status
  const getActivityDescription = (activity: Activity) => {
    const userName = activity.user.name
    const bookTitle = activity.book.title
    
    switch (activity.status) {
      case "APPROVED":
        return (
          <>
            <span className="font-medium">{userName}</span> telah disetujui untuk meminjam buku{" "}
            <span className="font-medium">{bookTitle}</span>
          </>
        )
      case "REJECTED":
        return (
          <>
            <span className="font-medium">{userName}</span> ditolak untuk meminjam buku{" "}
            <span className="font-medium">{bookTitle}</span>
          </>
        )
      case "PENDING":
        return (
          <>
            <span className="font-medium">{userName}</span> mengajukan peminjaman buku{" "}
            <span className="font-medium">{bookTitle}</span>
          </>
        )
      case "RETURNED":
        return (
          <>
            <span className="font-medium">{userName}</span> telah mengembalikan buku{" "}
            <span className="font-medium">{bookTitle}</span>
          </>
        )
      case "LATE":
        return (
          <>
            <span className="font-medium">{userName}</span> terlambat mengembalikan buku{" "}
            <span className="font-medium">{bookTitle}</span>
          </>
        )
      default:
        return (
          <>
            <span className="font-medium">{userName}</span> melakukan aktivitas pada buku{" "}
            <span className="font-medium">{bookTitle}</span>
          </>
        )
    }
  }

  const getBookCoverInitials = (bookTitle: string) => {
    return bookTitle
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  // Render skeleton loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={activity.book.coverImage || ""} alt={activity.book.title} />
                  <AvatarFallback>{getBookCoverInitials(activity.book.title)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(activity.status)}
                    <p className="text-sm">{getActivityDescription(activity)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.updatedAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
                <Link
                  href={`/admin/request/${activity.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Detail
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 