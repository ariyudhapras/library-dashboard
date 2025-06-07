import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can access this endpoint
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all book loans with RETURNED status
    const returnedLoans = await prisma.bookLoan.findMany({
      where: {
        status: "RETURNED",
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            stock: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true, // ✅ TAMBAHKAN INI!
          },
        },
      },
      orderBy: {
        actualReturnDate: "desc",
      },
    });

    return NextResponse.json(returnedLoans);
  } catch (error) {
    console.error("Error fetching returned books:", error);
    return NextResponse.json(
      { error: "Failed to fetch returned books" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to verify returns
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can update return status
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can verify returns" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Loan ID and status are required" },
        { status: 400 }
      );
    }

    // Get the current loan
    const currentLoan = await prisma.bookLoan.findUnique({
      where: { id },
    });

    if (!currentLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Update the loan status
    const updatedLoan = await prisma.bookLoan.update({
      where: { id },
      data: {
        status,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true, // ✅ TAMBAHKAN INI JUGA!
          },
        },
      },
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error verifying return:", error);
    return NextResponse.json(
      { error: "Failed to verify return" },
      { status: 500 }
    );
  }
}
