export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

    let query = supabase
      .from('bookLoan')
      .select(`
        id,
        borrowDate,
        returnDate,
        status,
        actualReturnDate,
        book:bookId (id, title, author, coverImage, stock),
        user:userId (id, name, email, profileImage)
      `)
      .order('createdAt', { ascending: false });

    if (userId) {
      query = query.eq('userId', parseInt(userId));
    }

    const { data: bookLoans, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching book loans:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch book loans: " + fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(bookLoans);
  } catch (error: any) {
    console.error("Error fetching book loans:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch book loans" },
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

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID in session' }, { status: 400 });
    }

    // Check if user already has an active loan for this book
    const { data: existingLoan, error: existingLoanError } = await supabase
      .from('bookLoan')
      .select('id')
      .eq('userId', userId)
      .eq('bookId', bookId)
      .in('status', [LoanStatus.PENDING, LoanStatus.APPROVED])
      .maybeSingle();

    if (existingLoanError) {
      console.error("Error checking existing loan:", existingLoanError);
      return NextResponse.json(
        { error: "Failed to check existing loans: " + existingLoanError.message },
        { status: 500 }
      );
    }

    if (existingLoan) {
      return NextResponse.json(
        { error: "Kamu sudah meminjam buku ini dan belum mengembalikannya." },
        { status: 400 }
      );
    }

    // Validate the book exists and has stock
    const { data: book, error: bookError } = await supabase
      .from('book')
      .select('id, stock')
      .eq('id', bookId)
      .single();

    if (bookError) {
      console.error("Error fetching book details:", bookError);
      if (bookError.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to fetch book details: " + bookError.message },
        { status: 500 }
      );
    }

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
    const { data: newLoan, error: createLoanError } = await supabase
      .from('bookLoan')
      .insert({
        userId: userId, // Ensure userId is a number
        bookId,
        borrowDate: new Date(borrowDate).toISOString(),
        returnDate: new Date(returnDate).toISOString(),
        notes,
        status: LoanStatus.PENDING,
      })
      .select(`
        id,
        borrowDate,
        returnDate,
        status,
        notes,
        book:bookId (id, title, author, coverImage),
        user:userId (id, name, email, profileImage)
      `)
      .single();

    if (createLoanError) {
      console.error("Error creating book loan:", createLoanError);
      return NextResponse.json(
        { error: "Failed to create book loan: " + createLoanError.message },
        { status: 500 }
      );
    }
    if (!newLoan) {
        return NextResponse.json({ error: 'Failed to retrieve created loan data.' }, { status: 500 });
    }

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book loan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create book loan" },
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
    const { data: currentLoan, error: fetchCurrentLoanError } = await supabase
      .from('bookLoan')
      .select('id, status, bookId, book:bookId (id, stock)')
      .eq('id', id)
      .single();

    if (fetchCurrentLoanError) {
      console.error("Error fetching current loan:", fetchCurrentLoanError);
      if (fetchCurrentLoanError.code === 'PGRST116') { // Not found
         return NextResponse.json({ error: "Loan not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to fetch loan details: " + fetchCurrentLoanError.message },
        { status: 500 }
      );
    }

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

    const { data: updatedLoan, error: updateLoanError } = await supabase
      .from('bookLoan')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        status,
        actualReturnDate,
        book:bookId (*),
        user:userId (id, name, email, profileImage)
      `)
      .single();

    if (updateLoanError) {
      console.error("Error updating book loan:", updateLoanError);
      return NextResponse.json(
        { error: "Failed to update book loan: " + updateLoanError.message },
        { status: 500 }
      );
    }
    if (!updatedLoan) {
        return NextResponse.json({ error: 'Failed to retrieve updated loan data after update.' }, { status: 500 });
    }

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
      if (currentLoan && currentLoan.book && Array.isArray(currentLoan.book) && currentLoan.book.length > 0) {
        const bookData = currentLoan.book[0]; // Access the first element of the array
        const currentStock = bookData.stock;
        const newStock = (currentStock !== null ? currentStock : 0) + stockChange;

        const { error: stockUpdateError } = await supabase
          .from('book')
          .update({ stock: newStock })
          .eq('id', currentLoan.bookId); // currentLoan.bookId refers to the book's ID stored in the loan table

        if (stockUpdateError) {
          console.error("Error updating book stock:", stockUpdateError);
          return NextResponse.json(
            { 
              warning: "Loan status updated, but failed to update book stock. Please check manually.", 
              error: stockUpdateError.message,
              updatedLoan 
            },
            { status: 207 } 
          );
        }
      } else {
        // If stockChange is needed but book data is not as expected, log a warning.
        // The loan status itself (updatedLoan) is already updated by this point.
        console.warn(
          `Book stock not updated for loan ID ${currentLoan?.id} due to missing/malformed related book data, despite stockChange=${stockChange}. Related book data: ${JSON.stringify(currentLoan?.book)}`
        );
      }
    }

    return NextResponse.json(updatedLoan);
  } catch (error: any) {
    console.error("Error updating book loan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update book loan" },
      { status: 500 }
    );
  }
}
