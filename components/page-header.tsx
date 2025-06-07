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
  variant?: "default" | "centered";
}

export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonLabel = "Tambah Buku",
  onAddClick,
  rightContent,
  className,
  variant = "default",
}: PageHeaderProps) {
  const isCentered = variant === "centered";

  return (
    <div
      className={cn(
        isCentered
          ? // Updated styling untuk konsistensi dengan homepage
            "relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6"
          : "flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div
        className={cn(
          isCentered ? "flex flex-col items-center text-center flex-1" : ""
        )}
      >
        <h1
          className={cn(
            isCentered
              ? // Updated styling untuk konsistensi dengan homepage
                "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight"
              : "text-2xl font-semibold sm:text-3xl tracking-tight"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              isCentered
                ? // Updated styling untuk konsistensi dengan homepage
                  "text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2"
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

      {/* Support untuk rightContent di variant centered (seperti profile dropdown di homepage) */}
      {isCentered && rightContent && (
        <div className="hidden sm:block mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
          <div className="flex justify-center sm:justify-end items-center gap-2">
            {rightContent}
          </div>
        </div>
      )}
    </div>
  );
}
