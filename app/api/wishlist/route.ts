import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Add to wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        bookId: bookId,
      },
      include: {
        book: true,
      },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    const formattedWishlist = wishlist.map((item) => ({
      id: item.id,
      title: item.book.title,
      author: item.book.author,
      coverUrl: item.book.coverImage || "/placeholder-book.jpg",
    }));

    return NextResponse.json(formattedWishlist);
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 