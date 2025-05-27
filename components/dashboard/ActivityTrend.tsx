import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { cn } from "@/lib/design-tokens"

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
  memberData: ChartDataItem[]
  loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-primary-100 bg-white p-3 shadow-sm dark:border-primary-700 dark:bg-primary-800">
        <p className="mb-2 text-sm font-medium text-primary-900 dark:text-primary-50">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-medium text-primary-900 dark:text-primary-50">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function ActivityTrend({ activityData, memberData, loading = false }: ActivityTrendProps) {
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  const renderActivityChart = () => {
    if (loading) {
      return <Skeleton className="h-[300px] w-full" />
    }

    const chartProps = {
      data: activityData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
      className: "text-primary-600 dark:text-primary-400"
    }

    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-primary-100 dark:stroke-primary-700" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="borrowings" 
              name="Borrowings" 
              stroke="var(--accent-500)" 
              fill="var(--accent-500)" 
              fillOpacity={0.2} 
            />
            <Area 
              type="monotone" 
              dataKey="returns" 
              name="Returns" 
              stroke="var(--success-500)" 
              fill="var(--success-500)" 
              fillOpacity={0.2} 
            />
            <Area 
              type="monotone" 
              dataKey="late" 
              name="Late" 
              stroke="var(--error-500)" 
              fill="var(--error-500)" 
              fillOpacity={0.2} 
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-primary-100 dark:stroke-primary-700" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="borrowings" 
              name="Borrowings" 
              stroke="var(--accent-500)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="returns" 
              name="Returns" 
              stroke="var(--success-500)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="late" 
              name="Late" 
              stroke="var(--error-500)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-primary-100 dark:stroke-primary-700" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={CustomTooltip} />
          <Legend />
          <Bar 
            dataKey="borrowings" 
            name="Borrowings" 
            fill="var(--accent-500)" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="returns" 
            name="Returns" 
            fill="var(--success-500)" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="late" 
            name="Late" 
            fill="var(--error-500)" 
            radius={[4, 4, 0, 0]} 
          />
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
          <CartesianGrid strokeDasharray="3 3" className="stroke-primary-100 dark:stroke-primary-700" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={CustomTooltip} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="newMembers" 
            name="New Members" 
            stroke="var(--primary-500)" 
            fill="var(--primary-500)" 
            fillOpacity={0.2} 
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
          <TabsList>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-0">
          {renderActivityChart()}
        </TabsContent>
        <TabsContent value="members" className="mt-0">
          {renderMemberChart()}
        </TabsContent>
      </Tabs>
    </div>
  )
} 