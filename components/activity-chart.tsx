"use client"

import { useState, useEffect, useCallback } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Define chart data types
interface ChartDataItem {
  name: string
  borrowings: number
  returns: number
  late: number
  fullDate?: string
}

export function ActivityChart() {
  const [timeRange, setTimeRange] = useState<"monthly">("monthly")
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  // Fetch chart data from API using useCallback
  const fetchChartData = useCallback(async () => {
    if (!isMounted) return;
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/reports')
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && data.statistics && Array.isArray(data.statistics.monthly)) {
        setChartData(data.statistics.monthly)
      } else {
        console.error("Invalid data format received:", data)
        setChartData([])
      }
      
    } catch (err) {
      console.error("Error fetching chart data:", err)
      setError("Gagal memuat data grafik. Silakan coba lagi nanti.")
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }, [isMounted])
  
  // Effect to set mounted state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])
  
  // Fetch data when timeRange changes
  useEffect(() => {
    if (isMounted) {
      fetchChartData()
    }
  }, [timeRange, fetchChartData, isMounted])
  
  // Custom tooltip to make it more informative
  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: Array<any>;
    label?: string;
  }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-medium text-foreground">{`${label} ${new Date().getFullYear()}`}</p>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-[#8884d8]">Peminjaman:</span>
            <span className="font-medium text-foreground">{payload[0].value}</span>
            
            <span className="text-[#82ca9d]">Pengembalian:</span>
            <span className="font-medium text-foreground">{payload[1].value}</span>
            
            <span className="text-[#ff7300]">Terlambat:</span>
            <span className="font-medium text-foreground">{payload[2].value}</span>
          </div>
        </div>
      )
    }
    
    return null
  }
  
  if (!isMounted) {
    return null
  }
  
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 rounded-md bg-primary px-4 py-2 text-white" 
          onClick={() => fetchChartData()} 
        >
          Coba Lagi
        </button>
      </div>
    )
  }
  
  // If no data, show empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-gray-500">Tidak ada data aktivitas yang tersedia</p>
      </div>
    )
  }
  
  return (
    <div className="h-[400px] w-full">
      <div className="mb-6 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Label htmlFor="time-range">Rentang Waktu:</Label>
          <Select value={timeRange} onValueChange={(value: "monthly") => setTimeRange(value)}>
            <SelectTrigger id="time-range" className="w-[180px]">
              <SelectValue placeholder="Pilih rentang waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Bulanan (tahun ini)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={CustomTooltip} />
          <Legend />
          <Line type="monotone" dataKey="borrowings" name="Peminjaman" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="returns" name="Pengembalian" stroke="#82ca9d" strokeWidth={2} />
          <Line type="monotone" dataKey="late" name="Terlambat" stroke="#ff7300" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 