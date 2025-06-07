"use client";

import { useEffect, useState } from "react";
import {
  Book,
  Users,
  Archive,
  AlertCircle,
  Clock,
  BookPlus,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DashboardLayout,
  DashboardSection,
  DashboardHeader,
  DashboardContent,
  DashboardGrid,
} from "@/components/dashboard/DashboardLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ActivityTrend } from "@/components/dashboard/ActivityTrend";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PopularBooks } from "@/components/dashboard/PopularBooks";
import { LowStockBooks } from "@/components/dashboard/LowStockBooks";
import { useRouter } from "next/navigation";
import BookDataTable from "@/components/book-data-table";
import { AddBookDialog } from "@/components/AddBookDialog";

/**
 * Dashboard Admin Page
 *
 * Menampilkan statistik perpustakaan dan aktivitas terbaru dengan data realtime
 * dari database. Page ini mencakup:
 * - Statistik summary (jumlah buku, peminjaman aktif, anggota, dll)
 * - Grafik tren aktivitas peminjaman dan pengembalian
 * - Daftar aktivitas terbaru
 * - Buku-buku populer
 * - Notifikasi buku dengan stok menipis
 * - Aksi cepat untuk navigasi
 */
export default function AdminDashboardPage() {
  // State untuk menyimpan data dashboard
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalBooks: null,
      activeBorrowedBooks: null,
      totalMembers: null,
      overdueBooks: null,
      pendingRequests: null,
    },
    monthlyTrends: [],
    memberTrends: [],
    recentActivities: [],
    popularBooks: [],
    lowStockBooks: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleCardClick = (type: string) => {
    switch (type) {
      case "books":
        router.push("/admin/books");
        break;
      case "activeLoans":
        router.push("/admin/requests?tab=approved");
        break;
      case "members":
        router.push("/admin/members");
        break;
      case "overdue":
        router.push("/admin/reports?tab=overdue");
        break;
      case "pending":
        router.push("/admin/requests?tab=pending");
        break;
      case "addBook":
        setIsAddDialogOpen(true);
        break;
      case "returns":
        router.push("/admin/returns");
        break;
    }
  };

  return (
    <DashboardLayout>
      {/* Header - Center Aligned */}
      <DashboardSection>
        <DashboardHeader>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-primary-50 mb-3">
              Dashboard
            </h1>
            <p className="text-lg md:text-xl text-primary-500 dark:text-primary-400">
              Overview of library statistics and recent activities
            </p>
          </div>
        </DashboardHeader>
      </DashboardSection>

      {/* Summary Cards */}
      <DashboardGrid>
        <div
          onClick={() => handleCardClick("books")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat semua buku"
        >
          <SummaryCard
            title="Total Books"
            value={dashboardData.summary.totalBooks}
            icon={Book}
            loading={loading}
            colorClass="text-accent-600 bg-accent-50 dark:bg-accent-950 dark:text-accent-400"
          />
        </div>
        <div
          onClick={() => handleCardClick("activeLoans")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-success-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat peminjaman aktif"
        >
          <SummaryCard
            title="Active Loans"
            value={dashboardData.summary.activeBorrowedBooks}
            icon={Archive}
            loading={loading}
            colorClass="text-success-600 bg-success-50 dark:bg-success-950 dark:text-success-400"
          />
        </div>
        <div
          onClick={() => handleCardClick("members")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat anggota perpustakaan"
        >
          <SummaryCard
            title="Total Members"
            value={dashboardData.summary.totalMembers}
            icon={Users}
            loading={loading}
            colorClass="text-primary-600 bg-primary-50 dark:bg-primary-950 dark:text-primary-400"
          />
        </div>
        <div
          onClick={() => handleCardClick("overdue")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-error-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat buku terlambat"
        >
          <SummaryCard
            title="Overdue Books"
            value={dashboardData.summary.overdueBooks}
            icon={AlertCircle}
            loading={loading}
            colorClass="text-error-600 bg-error-50 dark:bg-error-950 dark:text-error-400"
          />
        </div>
        <div
          onClick={() => handleCardClick("pending")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-warning-500 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Lihat permintaan peminjaman pending"
        >
          <SummaryCard
            title="Pending Requests"
            value={dashboardData.summary.pendingRequests}
            icon={Clock}
            loading={loading}
            colorClass="text-warning-600 bg-warning-50 dark:bg-warning-950 dark:text-warning-400"
          />
        </div>
        {/* Add Book Card */}
        <div
          onClick={() => handleCardClick("addBook")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-400 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Tambah buku baru"
        >
          <SummaryCard
            title="Add Book"
            value={null}
            icon={BookPlus}
            loading={loading}
            colorClass="text-accent-700 bg-accent-100 dark:bg-accent-900 dark:text-accent-300"
            description="Add a new book to the catalog"
          />
        </div>
        {/* Returns Card */}
        <div
          onClick={() => handleCardClick("returns")}
          className="cursor-pointer transition hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-warning-400 rounded-lg"
          tabIndex={0}
          role="button"
          aria-label="Proses pengembalian buku"
        >
          <SummaryCard
            title="Returns"
            value={null}
            icon={FileText}
            loading={loading}
            colorClass="text-warning-700 bg-warning-100 dark:bg-warning-900 dark:text-warning-300"
            description="Process book returns"
          />
        </div>
      </DashboardGrid>

      {/* Activity Charts */}
      <DashboardSection>
        <DashboardHeader>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-50">
              Library Activity Trends
            </h2>
          </div>
        </DashboardHeader>
        <DashboardContent>
          <ActivityTrend
            activityData={dashboardData.monthlyTrends}
            memberData={dashboardData.memberTrends}
            loading={loading}
          />
        </DashboardContent>
      </DashboardSection>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Low Stock Books (left) */}
        <DashboardSection>
          <DashboardHeader>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-50">
                Low Stock Books
              </h2>
            </div>
          </DashboardHeader>
          <DashboardContent>
            <LowStockBooks
              books={dashboardData.lowStockBooks}
              loading={loading}
            />
          </DashboardContent>
        </DashboardSection>
        {/* Popular Books (right) */}
        <DashboardSection>
          <DashboardHeader>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-50">
                Popular Books
              </h2>
            </div>
          </DashboardHeader>
          <DashboardContent>
            <PopularBooks
              books={dashboardData.popularBooks}
              loading={loading}
            />
          </DashboardContent>
        </DashboardSection>
      </div>
      {/* Add Book Dialog */}
      <AddBookDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </DashboardLayout>
  );
}
