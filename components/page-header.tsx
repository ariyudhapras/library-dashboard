"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
  rightContent?: ReactNode;
  className?: string;
  variant?: "default" | "centered"; // <--- TAMBAHAN: untuk kontrol layout
}

export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonLabel = "Tambah Buku",
  onAddClick,
  rightContent,
  className,
  variant = "default", // <--- default fallback
}: PageHeaderProps) {
  const isCentered = variant === "centered";

  return (
    <div
      className={cn(
        isCentered
          ? "mx-auto rounded-xl shadow p-6 mb-12 text-center"
          : "flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h1
          className={cn(
            isCentered
              ? "text-5xl font-bold mb-4"
              : "text-2xl font-semibold sm:text-3xl tracking-tight"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              isCentered
                ? "text-lg text-gray-700 dark:text-gray-400 font-semibold mt-2"
                : "mt-2 text-sm text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Tombol kanan hanya tampil kalau variant = default */}
      {!isCentered &&
        (rightContent
          ? rightContent
          : showAddButton && (
              <Button
                onClick={onAddClick}
                className="mt-4 w-full md:mt-0 md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            ))}
    </div>
  );
}
