import { Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface WishlistItemCardProps {
  id: string
  title: string
  author?: string
  coverUrl: string
  onRemove: (id: string) => void
  className?: string
  isRemoving?: boolean
}

export default function WishlistItemCard({
  id,
  title,
  author,
  coverUrl,
  onRemove,
  className,
  isRemoving = false,
}: WishlistItemCardProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hide, setHide] = useState(false)

  useEffect(() => {
    if (isRemoving) {
      // Start fade-out, then hide after animation
      const timeout = setTimeout(() => setHide(true), 350)
      return () => clearTimeout(timeout)
    } else {
      setHide(false)
    }
  }, [isRemoving])

  if (hide) return null

  const handleRemove = async () => {
    setIsLoading(true)
    try {
      await onRemove(id)
      toast({
        title: "Berhasil",
        description: "Buku berhasil dihapus dari wishlist",
      })
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal menghapus buku dari wishlist",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 active:scale-[0.98]",
        "duration-300",
        isRemoving && "opacity-0 max-h-0 pointer-events-none",
        className
      )}
      style={isRemoving ? { transition: 'opacity 0.3s, max-height 0.35s', maxHeight: 0, opacity: 0 } : {}}
      role="article"
      aria-labelledby={`wishlist-title-${id}`}
    >
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-slate-100">
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 id={`wishlist-title-${id}`} className="font-semibold line-clamp-2 text-lg">
            {title}
          </h3>
          {author && (
            <p className="mt-1 text-sm text-muted-foreground">Karya: {author}</p>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4 w-full"
          onClick={() => setIsDialogOpen(true)}
          aria-label="Hapus {title} dari wishlist"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus dari Wishlist
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus dari Wishlist?</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus buku ini dari wishlist?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading} aria-label="Batal hapus wishlist">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isLoading} aria-label="Konfirmasi hapus wishlist">
              {isLoading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 