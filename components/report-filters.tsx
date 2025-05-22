"use client"

import { useState } from "react"
import { format, subMonths } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, ChevronDownIcon, FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { Filter } from "lucide-react"

// Define types for filter options
interface FilterOption {
  value: string
  label: string
}

// Sample data for dropdowns
const statuses: FilterOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "PENDING", label: "Diajukan" },
  { value: "APPROVED", label: "Dipinjam" },
  { value: "RETURNED", label: "Dikembalikan" },
  { value: "LATE", label: "Terlambat" },
  { value: "REJECTED", label: "Ditolak" },
]

const membersList: FilterOption[] = [
  { value: "all", label: "Semua Anggota" },
  { value: "1", label: "Budi Santoso" },
  { value: "2", label: "Siti Nurhaliza" },
  { value: "3", label: "Ahmad Dahlan" },
  { value: "4", label: "Dewi Lestari" },
  { value: "5", label: "Rudi Hartono" },
]

const booksList: FilterOption[] = [
  { value: "all", label: "Semua Buku" },
  { value: "1", label: "Laskar Pelangi" },
  { value: "2", label: "Bumi Manusia" },
  { value: "3", label: "Filosofi Teras" },
  { value: "4", label: "Perahu Kertas" },
  { value: "5", label: "Pulang" },
]

interface ReportFiltersProps {
  onFilterChange?: (filters: {
    startDate: Date | null;
    endDate: Date | null;
    status: string | null;
    memberId: string | null;
  }) => void;
}

export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
  // Initialize date range to last 30 days
  const today = new Date()
  const defaultFromDate = subMonths(today, 1)
  
  const [isOpen, setIsOpen] = useState(false)
  const [fromDate, setFromDate] = useState<Date>(defaultFromDate)
  const [toDate, setToDate] = useState<Date>(today)
  const [statusFilter, setStatusFilter] = useState("all")
  const [memberFilter, setMemberFilter] = useState("all")
  const [bookFilter, setBookFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<string>("")
  
  // Reset all filters
  const resetFilters = () => {
    setFromDate(defaultFromDate)
    setToDate(today)
    setStatusFilter("all")
    setMemberFilter("all")
    setBookFilter("all")
    setSearchQuery("")
    setStartDate(null)
    setEndDate(null)
    setStatus(null)
    setMemberId("")
    
    if (onFilterChange) {
      onFilterChange({
        startDate: null,
        endDate: null,
        status: null,
        memberId: null
      })
    }
  }
  
  // Apply filters and notify parent component
  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        startDate,
        endDate,
        status,
        memberId: memberId.trim() || null
      })
    }
  }
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Filter Laporan</CardTitle>
            <CardDescription>Filter data laporan berdasarkan kriteria</CardDescription>
          </div>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Date Range - Start Date */}
          <div className="space-y-2">
            <Label htmlFor="from-date">Dari Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="from-date"
                  className="justify-start text-left font-normal w-full"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "d MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate === null ? undefined : startDate}
                  onSelect={(date: Date | undefined) => setStartDate(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Date Range - End Date */}
          <div className="space-y-2">
            <Label htmlFor="to-date">Sampai Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="to-date"
                  className="justify-start text-left font-normal w-full"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "d MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate === null ? undefined : endDate}
                  onSelect={(date: Date | undefined) => setEndDate(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status || "all"} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Diajukan</SelectItem>
                <SelectItem value="APPROVED">Dipinjam</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
                <SelectItem value="RETURNED">Dikembalikan</SelectItem>
                <SelectItem value="LATE">Terlambat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Member ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="member-id">ID Anggota</Label>
            <Input
              id="member-id"
              placeholder="Masukkan ID anggota"
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={resetFilters}>Reset</Button>
          <Button onClick={applyFilters}>Terapkan</Button>
        </div>
      </CardContent>
    </Card>
  )
} 