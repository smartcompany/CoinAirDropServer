import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.airdrop_id || !body.user_id || !body.reason) {
      return NextResponse.json(
        { error: 'airdrop_id, user_id, and reason are required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('scam_reports')
      .insert({
        airdrop_id: body.airdrop_id,
        user_id: body.user_id,
        reason: body.reason,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }
    
    // Check if we should flag this airdrop as high risk
    const { count } = await supabase
      .from('scam_reports')
      .select('*', { count: 'exact', head: true })
      .eq('airdrop_id', body.airdrop_id);
    
    // If more than 5 reports, increase risk score
    if (count && count >= 5) {
      await supabase
        .from('airdrops')
        .update({ risk_score: 90 })
        .eq('id', body.airdrop_id);
    }
    
    return NextResponse.json({ 
      data,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const airdropId = searchParams.get('airdropId');
    
    if (!airdropId) {
      return NextResponse.json(
        { error: 'airdropId is required' },
        { status: 400 }
      );
    }
    
    const { data, error, count } = await supabase
      .from('scam_reports')
      .select('*', { count: 'exact' })
      .eq('airdrop_id', airdropId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      data: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

