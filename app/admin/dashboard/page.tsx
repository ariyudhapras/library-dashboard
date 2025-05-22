"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Book, Users, Archive, AlertCircle, Clock } from "lucide-react"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { ActivityTrend } from "@/components/dashboard/ActivityTrend"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { PopularBooks } from "@/components/dashboard/PopularBooks"
import { LowStockBooks } from "@/components/dashboard/LowStockBooks"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { useToast } from "@/components/ui/use-toast"

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
      pendingRequests: null
    },
    monthlyTrends: [],
    memberTrends: [],
    recentActivities: [],
    popularBooks: [],
    lowStockBooks: []
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/stats")
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data dashboard. Silakan coba lagi nanti.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [toast])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader 
        title="Dashboard Admin" 
        description="Ringkasan dan statistik perpustakaan digital" 
        showAddButton={false} 
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard 
          title="Total Buku" 
          value={dashboardData.summary.totalBooks} 
          icon={Book}
          loading={loading}
          colorClass="text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400"
        />
        
        <SummaryCard 
          title="Sedang Dipinjam" 
          value={dashboardData.summary.activeBorrowedBooks} 
          icon={Archive}
          loading={loading}
          colorClass="text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400"
        />
        
        <SummaryCard 
          title="Total Anggota" 
          value={dashboardData.summary.totalMembers} 
          icon={Users}
          loading={loading}
          colorClass="text-violet-600 bg-violet-100 dark:bg-violet-950 dark:text-violet-400"
        />
        
        <SummaryCard 
          title="Buku Terlambat" 
          value={dashboardData.summary.overdueBooks} 
          icon={AlertCircle}
          loading={loading}
          colorClass="text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400"
        />
        
        <SummaryCard 
          title="Permintaan Baru" 
          value={dashboardData.summary.pendingRequests} 
          icon={Clock}
          loading={loading}
          colorClass="text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
        />
      </div>
      
      {/* Activity Charts */}
      <ActivityTrend 
        activityData={dashboardData.monthlyTrends} 
        memberData={dashboardData.memberTrends}
        loading={loading}
      />
      
      {/* Bottom Section - 3 columns on large screens, stacked on small */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activities */}
        <RecentActivity 
          activities={dashboardData.recentActivities}
          loading={loading}
        />
        
        {/* Popular Books */}
        <PopularBooks 
          books={dashboardData.popularBooks}
          loading={loading}
        />
        
        {/* Quick Actions and Low Stock Books */}
        <div className="flex flex-col gap-6">
          <QuickActions />
          <LowStockBooks 
            books={dashboardData.lowStockBooks}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
} 