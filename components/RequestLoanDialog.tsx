import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, AlertCircle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Alert,
  AlertTitle,
  AlertDescription as AlertDesc,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher?: string | null;
  year?: number | null;
  stock: number;
  category?: string | null;
  coverImage?: string | null;
  description?: string | null;
  isbn?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface RequestLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  onSuccess?: () => void;
}

export default function RequestLoanDialog({
  open,
  onOpenChange,
  book,
  onSuccess,
}: RequestLoanDialogProps) {
  const [borrowDate, setBorrowDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setBorrowDate(undefined);
      setReturnDate(undefined);
      setNotes("");
      setIsSubmitting(false);
      setIsCalendarOpen(false);
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (borrowDate) {
      const ret = addDays(borrowDate, 7);
      setReturnDate(ret);
    } else {
      setReturnDate(undefined);
    }
  }, [borrowDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setBorrowDate(date);
    setIsCalendarOpen(false);
  };

  const handleSubmit = async () => {
    if (!book || !borrowDate || !returnDate) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookloans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book.id,
          borrowDate: borrowDate.toISOString(),
          returnDate: returnDate.toISOString(),
          notes,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Gagal mengajukan peminjaman");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      setIsSubmitting(false);
      alert("Terjadi kesalahan saat mengajukan peminjaman");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-screen h-screen max-w-none rounded-none p-0 gap-0 shadow-lg overflow-y-auto md:max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl text-center">
            Ajukan Peminjaman Buku
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center mt-1 mb-2">
            Anda akan mengajukan peminjaman buku berikut.
            <br />
            Peminjaman akan diproses oleh petugas perpustakaan.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content wrapper */}
        {book && (
          <div className="px-6 py-6 grid gap-6">
            {/* Book Info Section */}
            <div className="flex gap-6 pb-6 border-b">
              <div className="h-48 w-32 overflow-hidden rounded-md shadow-sm bg-slate-100 flex-shrink-0">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CalendarIcon className="h-16 w-16 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Author : {book.author}
                  </p>
                  {book.year && (
                    <p className="text-sm text-muted-foreground">
                      Tahun: {book.year}
                    </p>
                  )}
                  {book.description && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                      {book.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Badge color="green" className="bg-green-50 text-green-700">
                    Stok: {book.stock}
                  </Badge>
                  {book.category && (
                    <Badge color="blue" className="bg-blue-50 text-blue-700">
                      {book.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Informasi Peminjaman</AlertTitle>
              <AlertDesc>
                Setiap pengguna hanya dapat meminjam 1 eksemplar dari judul buku
                yang sama dalam satu waktu.
              </AlertDesc>
            </Alert>

            {/* Form Section */}
            <div className="space-y-6">
              {/* Borrow Date */}
              <div className="grid gap-2.5">
                <Label className="text-sm font-medium">Tanggal Pinjam</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-slate-200 hover:bg-slate-50",
                        !borrowDate && "text-muted-foreground"
                      )}
                      onClick={() => setIsCalendarOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      {borrowDate ? (
                        format(borrowDate, "EEEE, dd MMMM yyyy", { locale: id })
                      ) : (
                        <span>Pilih tanggal pinjam</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={borrowDate}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date < new Date() || date > addDays(new Date(), 30)
                      }
                      initialFocus
                      className="rounded-lg border shadow-md p-3"
                      classNames={{
                        months: "space-y-4",
                        month: "space-y-4",
                        caption:
                          "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "grid grid-cols-7 gap-0.5",
                        head_cell:
                          "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] text-center",
                        row: "grid grid-cols-7 mt-2 gap-0.5",
                        cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-9 w-9 p-0 font-normal aria-selected:bg-blue-600 aria-selected:text-white aria-selected:hover:bg-blue-600",
                          "hover:bg-slate-100 rounded-md",
                          "focus:bg-slate-100 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white",
                          "disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        ),
                        day_selected:
                          "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                        day_today: "bg-slate-100",
                        day_outside: "opacity-50",
                        day_disabled: "opacity-50",
                        day_range_middle: "aria-selected:bg-slate-100",
                        day_hidden: "invisible",
                      }}
                      weekStartsOn={1}
                      ISOWeek
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  *Peminjaman hanya dapat dilakukan maksimal 30 hari ke depan
                </p>
              </div>

              {/* Return Date */}
              <div className="grid gap-2.5">
                <Label className="text-sm font-medium">
                  Tanggal Pengembalian
                </Label>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
                  <div className="text-sm font-medium text-slate-900">
                    {returnDate
                      ? format(returnDate, "EEEE, dd MMMM yyyy", { locale: id })
                      : "Pilih tanggal pinjam terlebih dahulu"}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Durasi peminjaman: 7 hari
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 px-4 py-3">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <span className="font-medium">Info:</span> Tanggal
                    pengembalian ditetapkan otomatis 7 hari dari tanggal pinjam
                    sesuai kebijakan perpustakaan. Harap mengembalikan buku
                    tepat waktu untuk menghindari denda keterlambatan.
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-2.5">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Catatan (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan untuk petugas perpustakaan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none border-slate-200"
                  rows={3}
                />
              </div>

              {/* Terms */}
              <div className="rounded-lg bg-slate-50 px-4 py-3 border border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-2">
                  Ketentuan Peminjaman:
                </h4>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
                  <li>Maksimal peminjaman adalah 7 hari</li>
                  <li>Denda keterlambatan Rp. 1.000/hari</li>
                  <li>
                    Kerusakan atau kehilangan buku akan dikenakan denda sesuai
                    harga buku
                  </li>
                  <li>Peminjaman maksimal 2 buku dalam waktu bersamaan</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!borrowDate || !returnDate || isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Ajukan Peminjaman"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
