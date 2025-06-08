export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: books, error } = await supabase.rpc('get_popular_books', { limit_count: 5 });

    if (error) {
      console.error('Error fetching popular books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch popular books: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular books' },
      { status: 500 }
    );
  }
} 