"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface WishlistButtonProps {
  bookId: number;
  className?: string;
}

export function WishlistButton({ bookId, className }: WishlistButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToWishlist = async () => {
    if (!session?.user) {
      toast.error("Please login to add books to your wishlist");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      toast.success("Book added to wishlist");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleAddToWishlist}
      disabled={isLoading}
    >
      <Heart className="h-4 w-4 mr-2" />
      {isLoading ? "Adding..." : "Add to Wishlist"}
    </Button>
  );
} 