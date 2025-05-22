import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookPlus, Clock, FileText, LayoutList, Users, Library } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href="/admin/books/add">
              <BookPlus className="h-5 w-5" />
              <span className="mt-1 text-xs">Tambah Buku</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href="/admin/requests">
              <Clock className="h-5 w-5" />
              <span className="mt-1 text-xs">Permintaan Peminjaman</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href="/admin/books">
              <Library className="h-5 w-5" />
              <span className="mt-1 text-xs">Katalog Buku</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href="/admin/members">
              <Users className="h-5 w-5" />
              <span className="mt-1 text-xs">Kelola Anggota</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href="/admin/returns">
              <FileText className="h-5 w-5" />
              <span className="mt-1 text-xs">Pengembalian</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link href="/admin/reports">
              <LayoutList className="h-5 w-5" />
              <span className="mt-1 text-xs">Laporan</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 