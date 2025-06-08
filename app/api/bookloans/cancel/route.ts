export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    const { data: loan, error: fetchError } = await supabase
      .from('bookLoan')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching loan:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch loan details: ' + fetchError.message }, { status: 500 });
    }

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Not allowed to cancel this loan' }, { status: 403 });
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json({ error: 'Hanya peminjaman dengan status PENDING yang bisa dibatalkan' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('bookLoan')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting loan:', deleteError);
      return NextResponse.json({ error: 'Failed to cancel loan: ' + deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Peminjaman berhasil dibatalkan' });
  } catch (err: any) {
    console.error('Error in cancel loan endpoint:', err);
    return NextResponse.json({ error: err.message || 'Failed to cancel loan' }, { status: 500 });
  }
}
