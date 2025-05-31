"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  showAddButton?: boolean
  addButtonLabel?: string
  onAddClick?: () => void
  rightContent?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonLabel = "Tambah Buku",
  onAddClick,
  rightContent,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {rightContent ? (
        rightContent
      ) : showAddButton && (
        <Button onClick={onAddClick} className="mt-4 w-full md:mt-0 md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {addButtonLabel}
        </Button>
      )}
    </div>
  )
}
