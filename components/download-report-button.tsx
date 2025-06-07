"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadReportButtonsProps {
  filters?: {
    startDate: Date | null;
    endDate: Date | null;
    status: string | null;
    memberId: string | null;
  };
}

export function DownloadReportButtons({ filters }: DownloadReportButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<"excel" | null>(
    null
  );

  const downloadReport = async (format: "excel") => {
    try {
      setIsDownloading(true);
      setDownloadingFormat(format);

      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          filters: filters || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export report");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Set filename based on format
      const date = new Date().toISOString().split("T")[0];
      const filename = `library_report_${date}.xlsx`;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Report downloaded successfully as ${format.toUpperCase()}`
      );
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download report. Please try again."
      );
    } finally {
      setIsDownloading(false);
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Print Report Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          window.print();
          toast.success("Print dialog opened");
        }}
        className="text-base px-4 py-2 hover:bg-gray-50"
      >
        <FileText className="h-4 w-4 mr-2" />
        Print Report
      </Button>

      {/* Download Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            disabled={isDownloading}
            className="text-base px-4 py-2 bg-blue-600 hover:bg-blue-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading Excel...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => downloadReport("excel")}
            disabled={isDownloading}
            className="cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
            <div>
              <div className="font-medium">Excel (.xlsx)</div>
              <div className="text-xs text-gray-500">Spreadsheet format</div>
            </div>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
