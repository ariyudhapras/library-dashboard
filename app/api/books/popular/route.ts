import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Group by bookId, count peminjaman, urutkan desc, ambil top 5
    const popular = await prisma.bookLoan.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
      take: 5,
    });

    // Ambil detail buku untuk setiap bookId
    const books = await Promise.all(
      popular.map(async (item: { bookId: number, _count: { bookId: number } }) => {
        const book = await prisma.book.findUnique({
          where: { id: item.bookId },
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        });
        return {
          ...book,
          borrowCount: item._count.bookId,
        };
      })
    );

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular books' },
      { status: 500 }
    );
  }
} 