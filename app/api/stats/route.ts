import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admin can access dashboard statistics.' },
        { status: 401 }
      );
    }

    // Get summary statistics
    const totalBooks = await prisma.book.count();
    
    const activeBorrowedBooks = await prisma.bookLoan.count({
      where: {
        status: 'APPROVED',
        actualReturnDate: null,
      }
    });
    
    const totalMembers = await prisma.user.count({
      where: { role: 'user' }
    });
    
    const overdueBooks = await prisma.bookLoan.count({
      where: {
        status: 'APPROVED',
        returnDate: { lt: new Date() },
        actualReturnDate: null,
      }
    });
    
    const pendingRequests = await prisma.bookLoan.count({
      where: { status: 'PENDING' }
    });

    // Get monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const currentMonth = subMonths(new Date(), i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const borrowings = await prisma.bookLoan.count({
        where: {
          borrowDate: {
            gte: startDate,
            lte: endDate,
          }
        }
      });
      
      const returns = await prisma.bookLoan.count({
        where: {
          actualReturnDate: {
            gte: startDate,
            lte: endDate,
          }
        }
      });
      
      const late = await prisma.bookLoan.count({
        where: {
          actualReturnDate: {
            gte: startDate,
            lte: endDate,
          },
          status: 'LATE'
        }
      });
      
      monthlyTrends.push({
        name: format(currentMonth, 'MMM'),
        month: format(currentMonth, 'yyyy-MM'),
        borrowings,
        returns,
        late
      });
    }

    // Get recent activities
    const recentActivities = await prisma.bookLoan.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      }
    });

    // Get popular books
    const popularBooks = await prisma.book.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        author: true,
        stock: true,
        coverImage: true,
        _count: {
          select: { bookLoans: true }
        }
      },
      orderBy: {
        bookLoans: {
          _count: 'desc'
        }
      }
    });

    // Get low stock books
    const lowStockBooks = await prisma.book.findMany({
      where: {
        stock: { lt: 5 }
      },
      select: {
        id: true,
        title: true,
        author: true,
        stock: true,
        coverImage: true
      },
      orderBy: {
        stock: 'asc'
      },
      take: 5
    });

    // Get new members trend
    const memberTrends = [];
    for (let i = 5; i >= 0; i--) {
      const currentMonth = subMonths(new Date(), i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const newMembers = await prisma.user.count({
        where: {
          role: 'user',
          createdAt: {
            gte: startDate,
            lte: endDate,
          }
        }
      });
      
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