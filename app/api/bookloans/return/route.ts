import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, actualReturnDate, status } = data;

    if (!id || !actualReturnDate || !status) {
      return NextResponse.json(
        { error: "Loan ID, actual return date, and status are required" },
        { status: 400 }
      );
    }

    // Get the current loan
    const currentLoan = await prisma.bookLoan.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!currentLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Check if the user is authorized to return this book
    const sessionUserId = Number(session.user.id);
    if (isNaN(sessionUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID in session" },
        { status: 400 }
      );
    }
    if (currentLoan.userId !== sessionUserId) {
      return NextResponse.json(
        { error: "You are not authorized to return this book" },
        { status: 403 }
      );
    }

    // Update the book loan
    const updatedLoan = await prisma.bookLoan.update({
      where: { id },
      data: {
        status,
        actualReturnDate: new Date(actualReturnDate),
      },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true, // ✅ FIXED: Added profileImage
          },
        },
      },
    });

    // Increase the book stock
    await prisma.book.update({
      where: { id: currentLoan.bookId },
      data: {
        stock: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error returning book:", error);
    return NextResponse.json(
      { error: "Failed to return book" },
      { status: 500 }
    );
  }
}
