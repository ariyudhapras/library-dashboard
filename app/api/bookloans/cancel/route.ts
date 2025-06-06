import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Loan ID is required' }, { status: 400 });
    }

    const loan = await prisma.bookLoan.findUnique({ where: { id } });

    if (!loan || loan.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json({ error: 'Hanya peminjaman dengan status PENDING yang bisa dibatalkan' }, { status: 400 });
    }

    await prisma.bookLoan.delete({ where: { id } });

    return NextResponse.json({ message: 'Peminjaman berhasil dibatalkan' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to cancel loan' }, { status: 500 });
  }
}
