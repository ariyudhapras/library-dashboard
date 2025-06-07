import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Updated authOptions import
import { supabase } from "@/lib/supabase"; // Replaced prisma with supabase

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const wishlistId = parseInt(params.id, 10);
    if (isNaN(wishlistId)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const { data: wishlistItem, error: findError } = await supabase
      .from('wishlist')
      .select('*')
      .eq('id', wishlistId)
      .eq('userId', session.user.id) // Assuming session.user.id is number
      .single();

    if (findError) {
      console.error("[WISHLIST_DELETE_FIND_ERROR]", findError);
      return new NextResponse("Internal error finding item", { status: 500 });
    }

    if (!wishlistItem) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistId);

    if (deleteError) {
      console.error("[WISHLIST_DELETE_ERROR]", deleteError);
      return new NextResponse("Internal error deleting item", { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 