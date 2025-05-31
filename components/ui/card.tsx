import { cn } from "@/lib/utils"
import * as React from "react"

export function Card({
  children,
  className = "",
  interactive = false,
  onClick,
  ...props
}: {
  children: React.ReactNode,
  className?: string,
  interactive?: boolean,
  onClick?: React.MouseEventHandler<HTMLDivElement>,
  [x: string]: any
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full rounded-lg p-4 shadow-md bg-white border border-gray-200 flex flex-col gap-2 transition",
        interactive
          ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 focus:ring-2 focus:ring-primary-500"
          : "",
        className
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 