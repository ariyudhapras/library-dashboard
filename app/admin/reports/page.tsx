"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { LibraryReportsTable } from "@/components/library-reports-table"
import { ReportFilters } from "@/components/report-filters"
import { DownloadReportButtons } from "@/components/download-report-buttons" 
import { ActivityChart } from "@/components/activity-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the report tab types
type ReportTabType = "all" | "active" | "overdue" | "popular"

// Define report data interface
interface ReportData {
  loans: Array<{
    id: number
    memberId: number
    memberName: string
    bookId: number
    bookTitle: string
    borrowDate: string
    returnDate: string
    actualReturnDate: string | null
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "LATE"
    lateDays: number
    fine: number
    notes: string
  }>
  statistics: {
    monthly: Array<{
      name: string
      borrowings: number
      returns: number
      late: number
    }>
    summary: {
      totalLoans: number
      activeLoans: number
      overdueLoans: number
      returnedLoans: number
      totalFines: number
      uniqueMembers: number
      uniqueBooks: number
    }
  }
}

export default function AdminReportsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ReportTabType>("all")
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: null as string | null,
    memberId: null as string | null
  })
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Fetch report data using useCallback
  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Build query parameters based on filters
      const queryParams = new URLSearchParams()
      
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate.toISOString())
      }
      
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate.toISOString())
      }
      
      if (filters.status) {
        queryParams.append('status', filters.status)
      }
      
      if (filters.memberId) {
        queryParams.append('memberId', filters.memberId)
      }
      
      // Build URL with query parameters
      const url = '/api/reports' + (queryParams.toString() ? `?${queryParams.toString()}` : '')
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`)
      }
      
      const data = await response.json()
      setReportData(data)
      setIsInitialLoad(false)
    } catch (error) {
      console.error("Error fetching report data:", error)
      setError("Gagal memuat data laporan. Silakan coba lagi nanti.")
      setIsInitialLoad(false)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Fetch report data on initial load and when filters change
  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])
  
  // Handle filter changes
  const handleFilterChange = (newFilters: {
    startDate: Date | null;
    endDate: Date | null;
    status: string | null;
    memberId: string | null;
  }) => {
    setFilters(newFilters)
  }

  // Show improved loading UI for initial load
  if (isInitialLoad) {
    return (
      <div className="flex flex-col h-screen w-full justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Memuat Data Laporan</h2>
        <p className="text-muted-foreground">Mohon tunggu sebentar...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Laporan" 
        description="Laporan detail aktivitas perpustakaan dan peminjaman" 
        showAddButton={false}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <button 
                className="ml-2 underline hover:text-primary"
                onClick={() => fetchReportData()}
              >
                Coba lagi
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Report Filters */}
        <ReportFilters onFilterChange={handleFilterChange} />

        {/* Download and Print Buttons */}
        <DownloadReportButtons />

        {/* Activity Charts */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Grafik Tren Aktivitas</CardTitle>
            <CardDescription>Tren peminjaman dan pengembalian buku per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        {reportData?.statistics?.summary && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Ringkasan Statistik</CardTitle>
              <CardDescription>Ringkasan statistik aktivitas perpustakaan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Total Peminjaman</div>
                  <div className="text-2xl font-bold">{reportData.statistics.summary.totalLoans}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Peminjaman Aktif</div>
                  <div className="text-2xl font-bold text-green-600">{reportData.statistics.summary.activeLoans}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Keterlambatan</div>
                  <div className="text-2xl font-bold text-orange-600">{reportData.statistics.summary.overdueLoans}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Total Denda</div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0
                    }).format(reportData.statistics.summary.totalFines)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Tabs */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Laporan Detail Aktivitas</CardTitle>
            <CardDescription>Data detail seluruh aktivitas perpustakaan</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setActiveTab(value as ReportTabType)}>
              <TabsList className="grid w-full grid-cols-4 md:w-auto">
                <TabsTrigger value="all">Semua Transaksi</TabsTrigger>
                <TabsTrigger value="active">Peminjaman Aktif</TabsTrigger>
                <TabsTrigger value="overdue">Keterlambatan</TabsTrigger>
                <TabsTrigger value="popular">Statistik Populer</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex h-40 w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex h-40 w-full flex-col items-center justify-center">
                  <p className="text-red-500">{error}</p>
                  <button 
                    className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
                    onClick={() => fetchReportData()}
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <TabsContent value={activeTab} className="mt-0">
                  <LibraryReportsTable type={activeTab} reportData={reportData?.loans || []} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 