export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Replaced prisma with supabase
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
    const { data: returnedLoansData, error: fetchError } = await supabase
      .from('bookLoan')
      .select(`
        *,
        book (id, title, author, coverImage, stock),
        user (id, name, email, profileImage)
      `)
      .eq('status', 'RETURNED')
      .order('actualReturnDate', { ascending: false });

    if (fetchError) {
      console.error("Error fetching returned books:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch returned books" },
        { status: 500 }
      );
    }
    const returnedLoans = returnedLoansData || [];

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
    const { data: currentLoan, error: findError } = await supabase
      .from('bookLoan')
      .select('*')
      .eq('id', id)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116: Row to be deleted was not found (for single())
      console.error("Error finding loan:", findError);
      return NextResponse.json({ error: "Error finding loan" }, { status: 500 });
    }

    if (!currentLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Update the loan status
    const { data: updatedLoan, error: updateError } = await supabase
      .from('bookLoan')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        book (id, title, author, coverImage),
        user (id, name, email, profileImage)
      `)
      .single(); // To get the updated record back

    if (updateError) {
      console.error("Error updating loan status:", updateError);
      return NextResponse.json(
        { error: "Failed to update loan status" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error verifying return:", error);
    return NextResponse.json(
      { error: "Failed to verify return" },
      { status: 500 }
    );
  }
}
