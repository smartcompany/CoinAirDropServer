import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const exchange = searchParams.get('exchange');
    const verified = searchParams.get('verified');
    const maxRisk = searchParams.get('maxRisk');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('airdrops')
      .select('*', { count: 'exact' })
      .order('post_date', { ascending: false });
    
    // Apply filters
    if (exchange) {
      query = query.eq('exchange', exchange.toLowerCase());
    }
    
    if (verified === 'true') {
      query = query.eq('verified', true);
    }
    
    if (maxRisk) {
      query = query.lte('risk_score', parseInt(maxRisk));
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching airdrops:', error);
      return NextResponse.json(
        { error: 'Failed to fetch airdrops' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}