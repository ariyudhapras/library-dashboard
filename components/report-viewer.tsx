"use client"

import { useState, useRef } from "react"
import { format, parseISO, isWithinInterval } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, FileText, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PeminjamanItem {
  id: number;
  memberName: string;
  bookTitle: string;
  date: string;
  fine: null;
}

interface PengembalianItem {
  id: number;
  memberName: string;
  bookTitle: string;
  date: string;
  fine: number | null;
}

interface DendaItem {
  id: number;
  memberName: string;
  bookTitle: string;
  date: string;
  fine: number;
}

// A union type for items in filteredData, as it can hold items from any report type after filtering by date
// However, when mapping or reducing, we often know the specific type based on reportType
type ReportItem = PeminjamanItem | PengembalianItem | DendaItem;

interface SampleData {
  peminjaman: PeminjamanItem[];
  pengembalian: PengembalianItem[];
  denda: DendaItem[];
}
import { Calendar } from "@/components/ui/calendar"

// Sample report data (replace with actual API data)
const sampleData: SampleData = {
  peminjaman: [
    {
      id: 1,
      memberName: "Budi Santoso",
      bookTitle: "Laskar Pelangi",
      date: "2023-05-01",
      fine: null,
    },
    {
      id: 2,
      memberName: "Siti Nurhaliza",
      bookTitle: "Bumi Manusia",
      date: "2023-05-03",
      fine: null,
    },
    {
      id: 3,
      memberName: "Ahmad Dahlan",
      bookTitle: "Filosofi Teras",
      date: "2023-05-05",
      fine: null,
    },
    {
      id: 4,
      memberName: "Dewi Lestari",
      bookTitle: "Perahu Kertas",
      date: "2023-05-07",
      fine: null,
    },
    {
      id: 5,
      memberName: "Rudi Hartono",
      bookTitle: "Pulang",
      date: "2023-05-10",
      fine: null,
    },
  ],
  pengembalian: [
    {
      id: 1,
      memberName: "Budi Santoso",
      bookTitle: "Laskar Pelangi",
      date: "2023-05-10",
      fine: null,
    },
    {
      id: 2,
      memberName: "Siti Nurhaliza",
      bookTitle: "Bumi Manusia",
      date: "2023-05-15",
      fine: 25000,
    },
    {
      id: 3,
      memberName: "Ahmad Dahlan",
      bookTitle: "Filosofi Teras",
      date: "2023-05-12",
      fine: null,
    },
    {
      id: 4,
      memberName: "Dewi Lestari",
      bookTitle: "Perahu Kertas",
      date: "2023-05-20",
      fine: 35000,
    },
    {
      id: 5,
      memberName: "Rudi Hartono",
      bookTitle: "Pulang",
      date: "2023-05-18",
      fine: 15000,
    },
  ],
  denda: [
    {
      id: 1,
      memberName: "Siti Nurhaliza",
      bookTitle: "Bumi Manusia",
      date: "2023-05-15",
      fine: 25000,
    },
    {
      id: 2,
      memberName: "Dewi Lestari",
      bookTitle: "Perahu Kertas",
      date: "2023-05-20",
      fine: 35000,
    },
    {
      id: 3,
      memberName: "Rudi Hartono",
      bookTitle: "Pulang",
      date: "2023-05-18",
      fine: 15000,
    },
    {
      id: 4,
      memberName: "Joko Widodo",
      bookTitle: "Negeri 5 Menara",
      date: "2023-05-22",
      fine: 40000,
    },
    {
      id: 5,
      memberName: "Anies Baswedan",
      bookTitle: "Sang Pemimpi",
      date: "2023-05-25",
      fine: 20000,
    },
  ],
}

// Format currency to Indonesian Rupiah
const formatCurrency = (amount: number | null): string => {
  if (amount === null) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date to Indonesian format
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-"
  return format(parseISO(dateString), "d MMMM yyyy", { locale: id })
}

export default function ReportViewer(): JSX.Element {
  const [reportType, setReportType] = useState<"peminjaman" | "pengembalian" | "denda">("peminjaman")
  const [fromDate, setFromDate] = useState<Date | undefined>(parseISO("2023-05-01"))
  const [toDate, setToDate] = useState<Date | undefined>(parseISO("2023-05-31"))
  const printRef = useRef<HTMLDivElement>(null)

  // Get report title based on type
  const getReportTitle = () => {
    switch (reportType) {
      case "peminjaman":
        return "Laporan Peminjaman Buku"
      case "pengembalian":
        return "Laporan Pengembalian Buku"
      case "denda":
        return "Laporan Denda"
      default:
        return "Laporan"
    }
  }

  // Determine the source array based on reportType for stronger type inference
  let itemsForCurrentReportType: PeminjamanItem[] | PengembalianItem[] | DendaItem[];
  if (reportType === 'peminjaman') {
    itemsForCurrentReportType = sampleData.peminjaman;
  } else if (reportType === 'pengembalian') {
    itemsForCurrentReportType = sampleData.pengembalian;
  } else { // reportType === 'denda'
    itemsForCurrentReportType = sampleData.denda;
  }

  // Filter data based on date range
  const filteredData = itemsForCurrentReportType.filter(item => {
    const itemDate = parseISO(item.date); // item.date should now be correctly typed as string
    return fromDate && toDate && isWithinInterval(itemDate, { start: fromDate, end: toDate });
  });

  // Handle print/export
  const handlePrint = () => {
    const contentElement = printRef.current;
    if (!contentElement) {
      console.error("Print content area not found.");
      alert("Area konten untuk dicetak tidak ditemukan. Silakan coba lagi.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Failed to open print window. Please check your browser's pop-up blocker settings.");
      alert("Gagal membuka jendela cetak. Mohon periksa pengaturan pemblokir pop-up peramban Anda.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${getReportTitle()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .report-info { margin-bottom: 20px; }
            .report-info p { margin: 5px 0; }
            .print-button { display: none; } /* Hide button in actual print */
            @media screen { /* Show button only on screen */
              .print-button { display: inline-block; padding: 10px 15px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 5px; }
            }
            @media print {
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${getReportTitle()}</h1>
          <div class="report-info">
            <p>Periode: ${fromDate ? format(fromDate, "d MMMM yyyy", { locale: id }) : "N/A"} - ${toDate ? format(toDate, "d MMMM yyyy", { locale: id }) : "N/A"}</p>
            <p>Tanggal Cetak: ${format(new Date(), "d MMMM yyyy", { locale: id })}</p>
          </div>
          ${contentElement.outerHTML}
          <div style="margin-top: 20px; text-align: center;">
            <button class="print-button" onclick="window.print()">Cetak Laporan Ini</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus(); // Focus the new window, helpful for some browsers
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>{getReportTitle()}</CardTitle>
        <CardDescription>Lihat dan cetak laporan berdasarkan periode dan jenis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="report-type">Jenis Laporan</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as "peminjaman" | "pengembalian" | "denda")}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Pilih jenis laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peminjaman">Peminjaman</SelectItem>
                <SelectItem value="pengembalian">Pengembalian</SelectItem>
                <SelectItem value="denda">Denda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dari Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus required={false} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Sampai Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus required={false} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan
          </Button>
        </div>

        <div className="rounded-md border" ref={printRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama Anggota</TableHead>
                <TableHead>Judul Buku</TableHead>
                <TableHead>Tanggal</TableHead>
                {(reportType === "pengembalian" || reportType === "denda") && <TableHead>Denda</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item: ReportItem, index: number) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.memberName}</TableCell>
                    <TableCell>{item.bookTitle}</TableCell>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    {(reportType === "pengembalian" || reportType === "denda") && (
                      <TableCell>{formatCurrency(item.fine)}</TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={reportType === "peminjaman" ? 4 : 5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Tidak ada data untuk periode yang dipilih</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredData.length > 0 && reportType === "denda" && (
          <div className="mt-4 text-right">
            <p className="text-sm font-medium">
              Total Denda: {formatCurrency(filteredData.reduce((sum: number, item) => sum + (item as DendaItem).fine, 0))}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
