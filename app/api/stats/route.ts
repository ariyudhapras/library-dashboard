export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Replaced prisma with supabase
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

/**
 * GET endpoint to fetch all dashboard statistics
 * This includes:
 * - Total books count
 * - Currently borrowed books count
 * - Total members count
 * - Overdue books count
 * - Pending loan requests count
 * - Monthly borrowing/returning trends
 * - Recent activity
 * - Popular books
 * - Low stock books
 */
export async function GET(request: NextRequest) {
  // Helper function to get counts from Supabase queries
  async function getSupabaseCount(queryBuilder: any): Promise<number> {
    const { count, error } = await queryBuilder;
    if (error) {
      console.error('Supabase count error:', error.message);
      throw new Error(`Failed to fetch count: ${error.message}`);
    }
    return count || 0;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admin can access dashboard statistics.' },
        { status: 401 }
      );
    }

    // Get summary statistics
    const totalBooks = await getSupabaseCount(
      supabase.from('book').select('*', { count: 'exact', head: true })
    );
    
    const activeBorrowedBooks = await getSupabaseCount(
      supabase.from('bookLoan').select('*', { count: 'exact', head: true })
        .eq('status', 'APPROVED')
        .is('actualReturnDate', null)
    );
    
    const totalMembers = await getSupabaseCount(
      supabase.from('user').select('*', { count: 'exact', head: true })
        .eq('role', 'user')
    );
    
    const overdueBooks = await getSupabaseCount(
      supabase.from('bookLoan').select('*', { count: 'exact', head: true })
        .eq('status', 'APPROVED')
        .lt('returnDate', new Date().toISOString())
        .is('actualReturnDate', null)
    );
    
    const pendingRequests = await getSupabaseCount(
      supabase.from('bookLoan').select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')
    );

    // Get monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const currentMonth = subMonths(new Date(), i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const borrowings = await getSupabaseCount(
        supabase.from('bookLoan').select('*', { count: 'exact', head: true })
          .gte('borrowDate', startDate.toISOString())
          .lte('borrowDate', endDate.toISOString())
      );
      
      const returns = await getSupabaseCount(
        supabase.from('bookLoan').select('*', { count: 'exact', head: true })
          .gte('actualReturnDate', startDate.toISOString())
          .lte('actualReturnDate', endDate.toISOString())
      );
      
      const late = await getSupabaseCount(
        supabase.from('bookLoan').select('*', { count: 'exact', head: true })
          .gte('actualReturnDate', startDate.toISOString())
          .lte('actualReturnDate', endDate.toISOString())
          .eq('status', 'LATE')
      );
      
      monthlyTrends.push({
        name: format(currentMonth, 'MMM'),
        month: format(currentMonth, 'yyyy-MM'),
        borrowings,
        returns,
        late
      });
    }

    // Get recent activities
    const { data: recentActivitiesData, error: recentActivitiesError } = await supabase
      .from('bookLoan')
      .select('*, user(id, name, email), book(id, title, author, coverImage)')
      .order('updatedAt', { ascending: false })
      .limit(5);

    if (recentActivitiesError) {
      console.error('Error fetching recent activities:', recentActivitiesError);
      return NextResponse.json({ error: 'Failed to fetch recent activities' }, { status: 500 });
    }
    const recentActivities = recentActivitiesData || [];

    // Get popular books
    // This uses an RPC call to a Supabase SQL function named 'get_popular_books'.
    // You need to create this function in your Supabase SQL Editor.
    // See the an example SQL function in the explanation.
    const { data: rpcPopularBooks, error: popularBooksError } = await supabase
      .rpc('get_popular_books', { limit_count: 5 });

    if (popularBooksError) {
      console.error('Error fetching popular books via RPC:', popularBooksError);
      return NextResponse.json({ error: 'Failed to fetch popular books' }, { status: 500 });
    }
    // Map RPC result to match expected structure if necessary (e.g., _count)
    const popularBooks = (rpcPopularBooks || []).map((book: any) => ({
      ...book,
      _count: { bookLoans: book.loan_count }, // Assuming RPC returns loan_count
    }));

    // Get low stock books
    const { data: lowStockBooksData, error: lowStockBooksError } = await supabase
      .from('book')
      .select('id, title, author, stock, coverImage')
      .lt('stock', 5)
      .order('stock', { ascending: true })
      .limit(5);

    if (lowStockBooksError) {
      console.error('Error fetching low stock books:', lowStockBooksError);
      return NextResponse.json({ error: 'Failed to fetch low stock books' }, { status: 500 });
    }
    const lowStockBooks = lowStockBooksData || [];

    // Get new members trend
    const memberTrends = [];
    for (let i = 5; i >= 0; i--) {
      const currentMonth = subMonths(new Date(), i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const newMembers = await getSupabaseCount(
        supabase.from('user').select('*', { count: 'exact', head: true })
          .eq('role', 'user')
          .gte('createdAt', startDate.toISOString())
          .lte('createdAt', endDate.toISOString())
      );
      
      memberTrends.push({
        name: format(currentMonth, 'MMM'),
        month: format(currentMonth, 'yyyy-MM'),
        newMembers
      });
    }

    // Combine all stats
    const dashboardStats = {
      summary: {
        totalBooks,
        activeBorrowedBooks,
        totalMembers,
        overdueBooks,
        pendingRequests
      },
      monthlyTrends,
      memberTrends,
      recentActivities,
      popularBooks,
      lowStockBooks
    };
    
    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 