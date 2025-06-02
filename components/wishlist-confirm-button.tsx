import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface WishlistConfirmButtonProps {
  bookId: number;
  className?: string;
  initialIsWishlisted?: boolean;
}

export function WishlistConfirmButton({
  bookId,
  className,
  initialIsWishlisted = false,
}: WishlistConfirmButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  // Sync local state with prop
  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted]);

  const handleAddToWishlist = async () => {
    if (!session?.user) {
      toast.error("Silakan login untuk menambah wishlist");
      setIsDialogOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) throw new Error("Gagal menambah wishlist");

      setIsWishlisted(true);
      toast.success("Buku berhasil ditambahkan ke wishlist");
    } catch (error) {
      toast.error("Gagal menambah wishlist");
      setIsWishlisted(false);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
  const buttonContent = (
    <Heart
      className={cn(
        "h-5 w-5",
        isWishlisted ? "fill-green-600 text-green-700" : ""
      )}
    />
  );

  return (
    <>
      <Button
        type="button"
        className={cn(
          "p-2 rounded-full transition-colors duration-150",
          isWishlisted
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200",
          className
        )}
        onClick={() => !isWishlisted && setIsDialogOpen(true)}
        disabled={isLoading || isWishlisted}
        aria-label={isWishlisted ? "Sudah di wishlist" : "Tambah ke wishlist"}
        aria-disabled={isWishlisted || isLoading}
      >
        {buttonContent}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah ke Wishlist?</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menambahkan buku ini ke wishlist?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleAddToWishlist}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Menambah..." : "Ya, Tambahkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
