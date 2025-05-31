import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
        userId: session.user.id,
      },
    });

    if (!wishlistItem) {
      return new NextResponse("Not found", { status: 404 });
    }

    await prisma.wishlist.delete({
      where: {
        id: wishlistId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 