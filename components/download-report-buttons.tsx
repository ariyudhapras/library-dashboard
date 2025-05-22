"use client"

import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, PrinterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function DownloadReportButtons() {
  // Function to handle printing the report
  const handlePrint = () => {
    toast({
      title: "Siap mencetak laporan",
      description: "Mempersiapkan halaman cetak...",
    })
    
    // In a real implementation, you might use a library like react-to-print
    setTimeout(() => {
      window.print()
    }, 500)
  }
  
  // Function to handle exporting to Excel
  const handleExportExcel = () => {
    toast({
      title: "Mengunduh laporan Excel",
      description: "Laporan akan diunduh dalam format Excel (.xlsx)",
    })
    
    // In a real implementation, you would generate and download an Excel file
    // For now, we'll just simulate a delay
    setTimeout(() => {
      toast({
        title: "Unduhan selesai",
        description: "Laporan Excel telah berhasil diunduh",
      })
    }, 1500)
  }
  
  // Function to handle exporting to CSV
  const handleExportCSV = () => {
    toast({
      title: "Mengunduh laporan CSV",
      description: "Laporan akan diunduh dalam format CSV",
    })
    
    // In a real implementation, you would generate and download a CSV file
    // For now, we'll just simulate a delay
    setTimeout(() => {
      toast({
        title: "Unduhan selesai",
        description: "Laporan CSV telah berhasil diunduh",
      })
    }, 1000)
  }
  
  // Function to handle exporting to PDF
  const handleExportPDF = () => {
    toast({
      title: "Mengunduh laporan PDF",
      description: "Laporan akan diunduh dalam format PDF",
    })
    
    // In a real implementation, you would generate and download a PDF file
    // For now, we'll just simulate a delay
    setTimeout(() => {
      toast({
        title: "Unduhan selesai",
        description: "Laporan PDF telah berhasil diunduh",
      })
    }, 2000)
  }
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-end gap-2 p-4">
        <Button variant="outline" onClick={handlePrint} className="bg-white">
          <PrinterIcon className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Unduh Laporan
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Format Unduhan</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportExcel}>
              <FileSpreadsheetIcon className="mr-2 h-4 w-4 text-green-600" />
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileTextIcon className="mr-2 h-4 w-4 text-blue-600" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileTextIcon className="mr-2 h-4 w-4 text-red-600" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
} 