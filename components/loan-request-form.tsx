"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Types
interface Book {
  id: number;
  title: string;
  author: string;
}

interface FormData {
  memberName: string;
  bookId: string;
  requestDate: Date;
}

interface FormErrors {
  memberName: string;
  bookId: string;
  requestDate: string;
}

// Sample book data for dropdown
const books: Book[] = [
  { id: 1, title: "Laskar Pelangi", author: "Andrea Hirata" },
  { id: 2, title: "Bumi Manusia", author: "Pramoedya Ananta Toer" },
  { id: 3, title: "Filosofi Teras", author: "Henry Manampiring" },
  { id: 4, title: "Pulang", author: "Tere Liye" },
  { id: 5, title: "Perahu Kertas", author: "Dee Lestari" },
  { id: 6, title: "Negeri 5 Menara", author: "Ahmad Fuadi" },
  { id: 7, title: "Sang Pemimpi", author: "Andrea Hirata" },
  { id: 8, title: "Ayat-Ayat Cinta", author: "Habiburrahman El Shirazy" },
  { id: 9, title: "Dilan: Dia adalah Dilanku Tahun 1990", author: "Pidi Baiq" },
  { id: 10, title: "Hujan", author: "Tere Liye" },
];

export default function LoanRequestForm(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const today = new Date();

  const [formData, setFormData] = useState<FormData>({
    memberName: "",
    bookId: "",
    requestDate: today,
  });

  const [errors, setErrors] = useState<FormErrors>({
    memberName: "",
    bookId: "",
    requestDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: "",
      } as FormErrors);
    }
  };

  const handleBookChange = (value: string): void => {
    setFormData({
      ...formData,
      bookId: value,
    });
    // Clear error when user selects
    if (errors.bookId) {
      setErrors({
        ...errors,
        bookId: "",
      });
    }
  };

  const handleDateChange = (date: Date | undefined): void => {
    if (date) {
      setFormData({
        ...formData,
        requestDate: date,
      });
      // Clear error when user selects
      if (errors.requestDate) {
        setErrors({
          ...errors,
          requestDate: "",
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      memberName: "",
      bookId: "",
      requestDate: "",
    };
    let isValid = true;

    if (!formData.memberName.trim()) {
      newErrors.memberName = "Nama anggota harus diisi";
      isValid = false;
    }

    if (!formData.bookId) {
      newErrors.bookId = "Judul buku harus dipilih";
      isValid = false;
    }

    if (!formData.requestDate) {
      newErrors.requestDate = "Tanggal pengajuan harus diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // Show success toast
      toast({
        title: "Pengajuan Berhasil",
        description: "Pengajuan peminjaman buku Anda telah berhasil diajukan.",
        variant: "default",
      });

      // Reset form
      setFormData({
        memberName: "",
        bookId: "",
        requestDate: today,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/user/beranda");
      }, 2000);
    } catch (error) {
      toast({
        title: "Pengajuan Gagal",
        description:
          "Terjadi kesalahan saat mengajukan peminjaman. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBook: Book | undefined = books.find(
    (book) => book.id.toString() === formData.bookId
  );

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Pengajuan Peminjaman Buku</CardTitle>
          <CardDescription>
            Silakan isi form berikut untuk mengajukan peminjaman buku.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="memberName">
                Nama Anggota <span className="text-red-500">*</span>
              </Label>
              <Input
                id="memberName"
                name="memberName"
                placeholder="Masukkan nama lengkap Anda"
                value={formData.memberName}
                onChange={handleInputChange}
                className={errors.memberName ? "border-red-500" : ""}
              />
              {errors.memberName && (
                <p className="text-sm text-red-500">{errors.memberName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookId">
                Judul Buku <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.bookId} onValueChange={handleBookChange}>
                <SelectTrigger
                  id="bookId"
                  className={errors.bookId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih judul buku" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Daftar Buku</SelectLabel>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id.toString()}>
                        {book.title} - {book.author}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.bookId && (
                <p className="text-sm text-red-500">{errors.bookId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestDate">
                Tanggal Pengajuan <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="requestDate"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      errors.requestDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.requestDate ? (
                      format(formData.requestDate, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.requestDate}
                    onSelect={handleDateChange}
                    disabled={(date) => date < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.requestDate && (
                <p className="text-sm text-red-500">{errors.requestDate}</p>
              )}
            </div>

            {selectedBook && (
              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 font-medium">Detail Buku</h4>
                <p className="text-sm">
                  <span className="font-medium">Judul:</span>{" "}
                  {selectedBook.title}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Penulis:</span>{" "}
                  {selectedBook.author}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-x-4 sm:space-y-0">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push("/user/beranda")}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Ajukan
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster />
    </>
  );
}
