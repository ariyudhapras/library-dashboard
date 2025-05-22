import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

// Chart data type
interface ChartDataItem {
  name: string
  borrowings: number
  returns: number
  late: number
  newMembers?: number
}

interface ActivityTrendProps {
  activityData: ChartDataItem[]
  memberData: {
    name: string
    newMembers: number
  }[]
  loading?: boolean
}

export function ActivityTrend({ activityData, memberData, loading = false }: ActivityTrendProps) {
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area")

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-medium text-foreground">{label}</p>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            {payload.map((entry: any) => (
              <>
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium text-foreground">{entry.value}</span>
              </>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const renderActivityChart = () => {
    if (loading) {
      return <Skeleton className="h-[300px] w-full" />
    }

    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Area type="monotone" dataKey="borrowings" name="Peminjaman" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
            <Area type="monotone" dataKey="returns" name="Pengembalian" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
            <Area type="monotone" dataKey="late" name="Terlambat" stroke="#ff7300" fill="#ff7300" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Line type="monotone" dataKey="borrowings" name="Peminjaman" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="returns" name="Pengembalian" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="late" name="Terlambat" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={CustomTooltip} />
          <Legend />
          <Bar dataKey="borrowings" name="Peminjaman" fill="#8884d8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returns" name="Pengembalian" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          <Bar dataKey="late" name="Terlambat" fill="#ff7300" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderMemberChart = () => {
    if (loading) {
      return <Skeleton className="h-[300px] w-full" />
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={memberData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="font-medium text-foreground">{label}</p>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                      <span style={{ color: "#4f46e5" }}>Anggota Baru:</span>
                      <span className="font-medium text-foreground">{payload[0].value}</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area 
            type="monotone" 
            dataKey="newMembers" 
            name="Anggota Baru" 
            stroke="#4f46e5" 
            fill="#4f46e5" 
            fillOpacity={0.2} 
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Tren Aktivitas Perpustakaan</CardTitle>
        <div className="flex items-center space-x-2">
          <Select 
            value={chartType} 
            onValueChange={(value) => setChartType(value as "area" | "line" | "bar")}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Tipe Grafik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="activity">Peminjaman & Pengembalian</TabsTrigger>
            <TabsTrigger value="members">Anggota Baru</TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="mt-0">
            {renderActivityChart()}
          </TabsContent>
          <TabsContent value="members" className="mt-0">
            {renderMemberChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 