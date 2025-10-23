import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get unique exchanges from airdrops table
    const { data, error } = await supabase
      .from('airdrops')
      .select('exchange')
      .not('exchange', 'is', null);

    if (error) {
      console.error('Error fetching exchanges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch exchanges' },
        { status: 500 }
      );
    }

    // Extract unique exchanges
    const uniqueExchanges = Array.from(new Set(data?.map(item => item.exchange) || []))
      .filter(exchange => exchange) // Remove null/undefined values
      .sort(); // Sort alphabetically

    return NextResponse.json({
      exchanges: uniqueExchanges,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
