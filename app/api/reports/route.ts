export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"; // Replaced prisma with supabase
import { differenceInDays } from "date-fns"

export async function GET(request: Request) {
  try {
    // Parse query parameters for filtering
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const status = url.searchParams.get('status')
    const memberId = url.searchParams.get('memberId')
    
    // Build filter conditions
    const filterConditions: any = {}
    
    if (startDate) {
      filterConditions.borrowDate = {
        gte: new Date(startDate)
      }
    }
    
    if (endDate) {
      filterConditions.borrowDate = {
        ...filterConditions.borrowDate,
        lte: new Date(endDate)
      }
    }
    
    if (status) {
      filterConditions.status = status
    }
    
    if (memberId && !isNaN(Number(memberId))) {
      filterConditions.userId = parseInt(memberId)
    }
    
    // Build Supabase query
    let query = supabase
      .from('bookLoan')
      .select(`
        *,
        user (id, name, email),
        book (id, title, author, isbn)
      `);

    // Apply filters
    if (startDate) {
      query = query.gte('borrowDate', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.lte('borrowDate', new Date(endDate).toISOString());
    }
    if (status && status !== "all") { // Assuming 'all' means no status filter
      query = query.eq('status', status);
    }
    if (memberId && !isNaN(Number(memberId))) {
      query = query.eq('userId', parseInt(memberId));
    }

    // Apply ordering
    query = query.order('borrowDate', { ascending: false });

    // Fetch all loan data
    const { data: loansData, error: dbError } = await query;

    if (dbError) {
      console.error("Error fetching loans from Supabase:", dbError);
      return NextResponse.json({ error: "Failed to fetch loan data" }, { status: 500 });
    }
    const loans = loansData || [];

    // Process the loans data to add calculated fields
    // @ts-ignore
    const processedLoans = loans.map(loan => {
      // Calculate late days if applicable
      let lateDays = 0
      let fine = 0

      if (loan.status === "LATE" && loan.actualReturnDate) {
        lateDays = differenceInDays(
          new Date(loan.actualReturnDate),
          new Date(loan.returnDate)
        )
        
        // Calculate fine (Rp5,000 per day)
        if (lateDays > 0) {
          fine = lateDays * 5000
        }
      }

      return {
        id: loan.id,
        memberId: loan.userId,
        memberName: loan.user.name,
        bookId: loan.bookId,
        bookTitle: loan.book.title,
        borrowDate: loan.borrowDate.toISOString(),
        returnDate: loan.returnDate.toISOString(),
        actualReturnDate: loan.actualReturnDate ? loan.actualReturnDate.toISOString() : null,
        status: loan.status,
        lateDays: lateDays,
        fine: fine,
        notes: loan.notes || "",
      }
    })

    // Calculate monthly statistics for the chart
    const currentYear = new Date().getFullYear()
    const monthlyStats = Array(12).fill(0).map((_, index) => {
      const month = index + 1
      
      // @ts-ignore
      const borrowings = loans.filter(loan => {
        const borrowDate = new Date(loan.borrowDate)
        return borrowDate.getMonth() + 1 === month && borrowDate.getFullYear() === currentYear
      }).length

      // @ts-ignore
      const returns = loans.filter(loan => {
        if (!loan.actualReturnDate) return false
        const returnDate = new Date(loan.actualReturnDate)
        return returnDate.getMonth() + 1 === month && returnDate.getFullYear() === currentYear
      }).length

      // @ts-ignore
      const late = loans.filter(loan => {
        if (!loan.actualReturnDate) return false
        const returnDate = new Date(loan.actualReturnDate)
        return returnDate.getMonth() + 1 === month && 
               returnDate.getFullYear() === currentYear && 
               loan.status === "LATE"
      }).length

      // Get month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      return {
        name: monthNames[index],
        borrowings,
        returns,
        late
      }
    })
    
    // Calculate some summary statistics
    // @ts-ignore
    const totalLoans = loans.length
    // @ts-ignore
    const activeLoans = loans.filter(loan => loan.status === "APPROVED").length
    // @ts-ignore
    const overdueLoans = loans.filter(loan => loan.status === "LATE").length
    // @ts-ignore
    const returnedLoans = loans.filter(loan => loan.status === "RETURNED").length
    // @ts-ignore
    const totalFines = processedLoans.reduce((sum, loan) => sum + loan.fine, 0)
    
    // Get unique count of members and books
    // @ts-ignore
    const uniqueMembers = new Set(loans.map(loan => loan.userId)).size
    // @ts-ignore
    const uniqueBooks = new Set(loans.map(loan => loan.bookId)).size

    return NextResponse.json({
      loans: processedLoans,
      statistics: {
        monthly: monthlyStats,
        summary: {
          totalLoans,
          activeLoans,
          overdueLoans,
          returnedLoans,
          totalFines,
          uniqueMembers,
          uniqueBooks
        }
      }
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    )
  }
} 