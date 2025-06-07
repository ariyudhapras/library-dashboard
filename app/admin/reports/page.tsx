"use client";

import { useState, useEffect, useCallback } from "react";
import { LibraryReportsTable } from "@/components/library-reports-table";
import { ReportFilters } from "@/components/report-filters";
import { DownloadReportButtons } from "@/components/download-report-button";
import { ActivityChart } from "@/components/activity-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  FileText,
  TrendingUp,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the report tab types
type ReportTabType = "all" | "active" | "overdue" | "popular";

// Define report data interface
interface ReportData {
  loans: Array<{
    id: number;
    memberId: number;
    memberName: string;
    bookId: number;
    bookTitle: string;
    borrowDate: string;
    returnDate: string;
    actualReturnDate: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "LATE";
    lateDays: number;
    fine: number;
    notes: string;
  }>;
  statistics: {
    monthly: Array<{
      name: string;
      borrowings: number;
      returns: number;
      late: number;
    }>;
    summary: {
      totalLoans: number;
      activeLoans: number;
      overdueLoans: number;
      returnedLoans: number;
      totalFines: number;
      uniqueMembers: number;
      uniqueBooks: number;
    };
  };
}

export default function AdminReportsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTabType>("all");
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: null as string | null,
    memberId: null as string | null,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch report data using useCallback
  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters based on filters
      const queryParams = new URLSearchParams();

      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate.toISOString());
      }

      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate.toISOString());
      }

      if (filters.status) {
        queryParams.append("status", filters.status);
      }

      if (filters.memberId) {
        queryParams.append("memberId", filters.memberId);
      }

      // Build URL with query parameters
      const url =
        "/api/reports" +
        (queryParams.toString() ? `?${queryParams.toString()}` : "");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError("Failed to load report data. Please try again later.");
      setIsInitialLoad(false);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch report data on initial load and when filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle filter changes
  const handleFilterChange = (newFilters: {
    startDate: Date | null;
    endDate: Date | null;
    status: string | null;
    memberId: string | null;
  }) => {
    setFilters(newFilters);
  };

  // Show improved loading UI for initial load
  if (isInitialLoad) {
    return (
      <div className="w-full mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Loading Report Data
            </h2>
            <p className="text-gray-600">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      {/* ENHANCED HEADER - Matching Other Admin Pages */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 mb-2 sm:mb-4 leading-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-2">
            Comprehensive library statistics and detailed activity reports.
          </p>
        </div>
        {/* Download Buttons in Header */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
          <DownloadReportButtons filters={filters} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-red-200">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReportData()}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ENHANCED FILTERS SECTION */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <BarChart3 className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Report Filters
          </h2>
          <p className="text-base text-gray-600">
            Filter data based on specific criteria
          </p>
        </div>
        <ReportFilters onFilterChange={handleFilterChange} />
      </div>

      {/* ENHANCED SUMMARY STATISTICS */}
      {reportData?.statistics?.summary && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Summary Statistics
            </h2>
            <p className="text-base text-gray-600">
              Overview of library activity statistics
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Total Loans
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {reportData.statistics.summary.totalLoans}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Active Loans
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {reportData.statistics.summary.activeLoans}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Overdue Books
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {reportData.statistics.summary.overdueLoans}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Total Fines
                </span>
              </div>
              <div className="text-xl font-bold text-purple-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(reportData.statistics.summary.totalFines)}
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Unique Members
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {reportData.statistics.summary.uniqueMembers}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Unique Books
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {reportData.statistics.summary.uniqueBooks}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  Returned Books
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {reportData.statistics.summary.returnedLoans}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED ACTIVITY CHART */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Activity Trends
          </h2>
          <p className="text-base text-gray-600">
            Monthly borrowing and return trends
          </p>
        </div>
        <ActivityChart />
      </div>

      {/* ENHANCED DETAILED REPORTS TABLE */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <FileText className="h-7 w-7 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Detailed Activity Reports
            </h2>
            <p className="text-base text-gray-600">
              Comprehensive data of all library activities
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as ReportTabType)}
          >
            {/* ENHANCED TABS */}
            <TabsList className="mb-6 bg-gray-100 p-2 rounded-xl h-auto">
              <TabsTrigger
                value="all"
                className="text-base font-semibold px-6 py-3 rounded-lg"
              >
                All Transactions
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="text-base font-semibold px-6 py-3 rounded-lg"
              >
                Active Loans
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                className="text-base font-semibold px-6 py-3 rounded-lg"
              >
                Overdue Books
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="text-base font-semibold px-6 py-3 rounded-lg"
              >
                Popular Statistics
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-lg text-gray-600">
                    Loading report data...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Failed to Load Data
                </h3>
                <p className="text-base text-gray-600 mb-6">{error}</p>
                <Button
                  onClick={() => fetchReportData()}
                  size="lg"
                  className="text-base px-6 py-3"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <TabsContent value={activeTab} className="mt-0">
                <LibraryReportsTable
                  type={activeTab}
                  reportData={reportData?.loans || []}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Mobile hint */}
      <div className="block md:hidden text-sm text-center text-muted-foreground mt-4 select-none">
        <span className="inline-flex items-center gap-2">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 18l6-6-6-6" />
          </svg>
          Swipe right to see more details
        </span>
      </div>
    </div>
  );
}
