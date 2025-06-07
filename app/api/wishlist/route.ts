import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Updated authOptions import
import { supabase } from "@/lib/supabase"; // Replaced prisma with supabase

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
    const { data: book, error: bookError } = await supabase
      .from('book')
      .select('id')
      .eq('id', bookId)
      .single();

    if (bookError) {
      console.error("Error checking book existence:", bookError);
      return NextResponse.json(
        { error: "Failed to verify book" },
        { status: 500 }
      );
    }

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Add to wishlist
    const { data: newWishlistItem, error: createError } = await supabase
      .from('wishlist')
      .insert({
        userId: session.user.id, // Assuming session.user.id is number
        bookId: bookId,
      })
      .select('*, book(*)') // Fetch the created item and the related book
      .single();

    if (createError) {
      console.error("Error adding to wishlist:", createError);
      return NextResponse.json(
        { error: "Failed to add to wishlist" },
        { status: 500 }
      );
    }
    // Supabase returns the created item with the nested book if select is correct
    const wishlist = newWishlistItem;

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

    const { data: wishlistData, error: fetchError } = await supabase
      .from('wishlist')
      .select('id, book (id, title, author, coverImage)') // Select specific fields from book
      .eq('userId', session.user.id); // Assuming session.user.id is number

    if (fetchError) {
      console.error("[WISHLIST_GET_SUPABASE_ERROR]", fetchError);
      return new NextResponse("Internal error fetching wishlist", { status: 500 });
    }
    const wishlist = wishlistData || [];

    const formattedWishlist = wishlist.map((item: any) => ({
      id: item.id,
      // Ensure item.book is not null and has the expected properties
      title: item.book?.title || 'N/A',
      author: item.book?.author || 'N/A',
      coverUrl: item.book?.coverImage || "/placeholder-book.jpg",
    }));

    return NextResponse.json(formattedWishlist);
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 