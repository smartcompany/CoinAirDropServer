import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }
    
    // Return default preferences if not found
    if (!data) {
      return NextResponse.json({
        data: {
          user_id: userId,
          exchanges: ['binance', 'bybit', 'upbit', 'bithumb'],
          chains: [],
          min_reward: null,
          max_risk_level: 70,
          push_enabled: true,
          fcm_token: null,
        },
      });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }
    
    // Upsert preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: body.user_id,
        exchanges: body.exchanges || ['binance', 'bybit', 'upbit', 'bithumb'],
        chains: body.chains || [],
        min_reward: body.min_reward || null,
        max_risk_level: body.max_risk_level || 70,
        push_enabled: body.push_enabled !== undefined ? body.push_enabled : true,
        fcm_token: body.fcm_token || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving preferences:', error);
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

