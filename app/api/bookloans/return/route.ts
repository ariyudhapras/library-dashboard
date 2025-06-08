export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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
    const { data: currentLoan, error: fetchLoanError } = await supabase
      .from('bookLoan')
      .select('*, book (*)') // Selects all from bookLoan and all related book fields
      .eq('id', id)
      .single();

    if (fetchLoanError) {
      console.error('Error fetching loan for return:', fetchLoanError);
      return NextResponse.json({ error: 'Failed to fetch loan details: ' + fetchLoanError.message }, { status: 500 });
    }


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
    const { data: updatedLoanData, error: updateLoanError } = await supabase
      .from('bookLoan')
      .update({
        status,
        actualReturnDate: new Date(actualReturnDate).toISOString(),
      })
      .eq('id', id)
      .select('*, book (*), user (id, name, email, profileImage)') // Re-fetch related data after update
      .single();

    if (updateLoanError) {
      console.error('Error updating loan for return:', updateLoanError);
      return NextResponse.json({ error: 'Failed to update loan: ' + updateLoanError.message }, { status: 500 });
    }
    if (!updatedLoanData) {
        return NextResponse.json({ error: 'Failed to retrieve updated loan data.' }, { status: 500 });
    }

    // Increase the book stock
    // Supabase doesn't have a direct increment. We need to fetch, then update.
    // This should ideally be in a transaction, but Supabase JS client doesn't offer them directly.
    // We'll proceed with caution or suggest an RPC function for atomicity.
    // For now, a direct read and write:
    const { data: bookToUpdate, error: fetchBookError } = await supabase
      .from('book')
      .select('stock')
      .eq('id', currentLoan.bookId)
      .single();

    if (fetchBookError || !bookToUpdate) {
      console.error('Error fetching book for stock update:', fetchBookError);
      // Potentially roll back loan update or log inconsistency
      return NextResponse.json({ error: 'Failed to fetch book for stock update: ' + (fetchBookError?.message || 'Book not found') }, { status: 500 });
    }

    const { error: updateStockError } = await supabase
      .from('book')
      .update({ stock: (bookToUpdate.stock || 0) + 1 })
      .eq('id', currentLoan.bookId);

    if (updateStockError) {
      console.error('Error updating book stock:', updateStockError);
      // Potentially roll back loan update or log inconsistency
      return NextResponse.json({ error: 'Failed to update book stock: ' + updateStockError.message }, { status: 500 });
    }

    return NextResponse.json(updatedLoanData);
  } catch (error: any) {
    console.error("Error returning book:", error);
    return NextResponse.json(
      { error: error.message || "Failed to return book" },
      { status: 500 }
    );
  }
}
