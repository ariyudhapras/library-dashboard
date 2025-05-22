import ActiveLoanTable from "@/components/active-loan-table"

export default function PeminjamanPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Peminjaman Aktif</h1>
        <p className="mt-2 text-muted-foreground">
          Daftar buku yang sedang Anda pinjam dari perpustakaan digital
        </p>
      </div>
      <ActiveLoanTable />
    </div>
  )
} 