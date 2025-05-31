import Link from "next/link"
import { BookPlus, Clock, FileText, LayoutList, Users, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/design-tokens"

const actions = [
  {
    title: "Add Book",
    href: "/admin/books/add",
    icon: BookPlus,
    description: "Add a new book to the library catalog",
  },
  {
    title: "Loan Requests",
    href: "/admin/requests",
    icon: Clock,
    description: "View and manage loan requests",
  },
  {
    title: "Book Catalog",
    href: "/admin/books",
    icon: Library,
    description: "Browse and manage book catalog",
  },
  {
    title: "Members",
    href: "/admin/members",
    icon: Users,
    description: "Manage library members",
  },
  {
    title: "Returns",
    href: "/admin/returns",
    icon: FileText,
    description: "Process book returns",
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: LayoutList,
    description: "View library reports and statistics",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {actions.map((action) => (
        <Button
          key={action.href}
          asChild
          variant="outline"
          className={cn(
            "h-auto flex-col items-start gap-2 p-4 text-left",
            "hover:bg-primary-50 dark:hover:bg-primary-800/50",
            "border-primary-100 dark:border-primary-700"
          )}
        >
          <Link href={action.href}>
            <action.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <div className="space-y-1.5">
              <span className="text-base font-semibold text-primary-900 dark:text-primary-50">
                {action.title}
              </span>
              <p className="text-sm text-primary-500 dark:text-primary-400">
                {action.description}
              </p>
            </div>
          </Link>
        </Button>
      ))}
    </div>
  )
} 