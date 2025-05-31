"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import WishlistItemCard from "@/components/wishlist-item-card";

interface WishlistItem {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login-user");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) throw new Error("Failed to fetch wishlist");
        const data = await response.json();
        setWishlist(data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router]);

  const handleRemoveFromWishlist = async (id: string) => {
    setRemovingIds((prev) => [...prev, id]);
    const prevWishlist = wishlist;
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from wishlist");
      toast.success("Buku berhasil dihapus dari wishlist");
    } catch (error) {
      setWishlist(prevWishlist);
      toast.error("Gagal menghapus buku dari wishlist");
    } finally {
      setRemovingIds((prev) => prev.filter((rid) => rid !== id));
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Memuat wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <BookOpen className="w-16 h-16 mb-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-xl font-semibold mb-2 text-center">Anda belum memiliki buku di wishlist.</h2>
        <p className="text-muted-foreground text-center mb-4">Jelajahi katalog dan tambahkan favorit Anda!</p>
        <a
          href="/user/katalog"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white font-medium shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Jelajahi katalog buku"
        >
          Jelajahi Katalog
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center">Wishlist Saya</h1>
      <p className="text-muted-foreground text-center mb-8">Kumpulan buku yang Anda simpan untuk nanti</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <WishlistItemCard
            key={item.id}
            {...item}
            onRemove={handleRemoveFromWishlist}
          />
        ))}
      </div>
    </div>
  );
} 