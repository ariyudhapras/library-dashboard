import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// LoanStatus enum values
const LoanStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
  LATE: "LATE",
};

// GET endpoint to fetch all book loans or filtered by userId
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // If user is not admin and trying to get loans without specifying userId
    // or trying to access another user's loans
    if (
      session.user.role !== "admin" &&
      (!userId || Number(userId) !== Number(session.user.id))
    ) {
      return NextResponse.json(
        { error: "Unauthorized to access these loans" },
        { status: 403 }
      );
    }

    let whereClause = {};
    if (userId) {
      whereClause = {
        userId: parseInt(userId),
      };
    }

    const bookLoans = await prisma.bookLoan.findMany({
      where: whereClause,
      select: {
        id: true,
        borrowDate: true,
        returnDate: true,
        status: true,
        actualReturnDate: true,
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
            profileImage: true, // ✅ FIXED: Added profileImage
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookLoans);
  } catch (error) {
    console.error("Error fetching book loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch book loans" },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new book loan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { bookId, borrowDate, returnDate, notes } = data;

    // Validate required fields
    if (!bookId || !borrowDate || !returnDate) {
      return NextResponse.json(
        { error: "Book ID, borrow date, and return date are required" },
        { status: 400 }
      );
    }

    const userId = session.user.id; // Assuming session.user.id is already a number as implied by the TS error

    // Check if user already has an active loan for this book
    const existingLoan = await prisma.bookLoan.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingLoan) {
      return NextResponse.json(
        { error: "Kamu sudah meminjam buku ini dan belum mengembalikannya." },
        { status: 400 }
      );
    }

    // Validate the book exists and has stock
    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.stock <= 0) {
      return NextResponse.json(
        { error: "Book is out of stock" },
        { status: 400 }
      );
    }

    // Create the book loan
    const newLoan = await prisma.bookLoan.create({
      data: {
        userId: userId,
        bookId,
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
        notes,
        status: LoanStatus.PENDING,
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
            profileImage: true, // ✅ FIXED: Added profileImage
          },
        },
      },
    });

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error) {
    console.error("Error creating book loan:", error);
    return NextResponse.json(
      { error: "Failed to create book loan" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a book loan status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can update loan status
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can update loan status" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { id, status, actualReturnDate } = data;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Loan ID and status are required" },
        { status: 400 }
      );
    }

    // Get the current loan to calculate stock change
    const currentLoan = await prisma.bookLoan.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!currentLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Update the book loan
    const updateData: any = {
      status,
    };

    if (actualReturnDate) {
      updateData.actualReturnDate = new Date(actualReturnDate);
    }

    const updatedLoan = await prisma.bookLoan.update({
      where: { id },
      data: updateData,
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

    // Update book stock based on status change
    let stockChange = 0;

    // If status changed to APPROVED, decrease stock
    if (
      status === LoanStatus.APPROVED &&
      currentLoan.status !== LoanStatus.APPROVED
    ) {
      stockChange = -1;
    }
    // If status changed from APPROVED to RETURNED, increase stock
    else if (
      status === LoanStatus.RETURNED &&
      currentLoan.status === LoanStatus.APPROVED
    ) {
      stockChange = 1;
    }

    // Update book stock if needed
    if (stockChange !== 0) {
      await prisma.book.update({
        where: { id: currentLoan.bookId },
        data: {
          stock: {
            increment: stockChange,
          },
        },
      });
    }

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error updating book loan:", error);
    return NextResponse.json(
      { error: "Failed to update book loan" },
      { status: 500 }
    );
  }
}
