import { cn } from "@/lib/utils"
import * as React from "react"

const colorMap: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-800",
}

export function Badge({ color = "gray", children, className = "" }: { color?: 'green'|'yellow'|'red'|'blue'|'gray', children: React.ReactNode, className?: string }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded text-xs font-semibold",
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {children}
    </span>
  )
} 