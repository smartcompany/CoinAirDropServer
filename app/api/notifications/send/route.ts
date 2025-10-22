import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendMulticastNotification } from '@/lib/firebase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { airdrop_id, title, body: messageBody } = body;
    
    if (!airdrop_id || !title || !messageBody) {
      return NextResponse.json(
        { error: 'airdrop_id, title, and body are required' },
        { status: 400 }
      );
    }
    
    // Get the airdrop
    const { data: airdrop } = await supabase
      .from('airdrops')
      .select('*')
      .eq('id', airdrop_id)
      .single();
    
    if (!airdrop) {
      return NextResponse.json(
        { error: 'Airdrop not found' },
        { status: 404 }
      );
    }
    
    // Get all users with push enabled and matching preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('fcm_token, exchanges, max_risk_level')
      .eq('push_enabled', true)
      .not('fcm_token', 'is', null);
    
    if (!preferences || preferences.length === 0) {
      return NextResponse.json({
        message: 'No users to notify',
        sent: 0,
      });
    }
    
    // Filter users based on their preferences
    const tokens = preferences
      .filter((pref) => {
        const matchesExchange = pref.exchanges.includes(airdrop.exchange);
        const matchesRisk = airdrop.risk_score <= pref.max_risk_level;
        return matchesExchange && matchesRisk;
      })
      .map((pref) => pref.fcm_token)
      .filter((token): token is string => token !== null);
    
    if (tokens.length === 0) {
      return NextResponse.json({
        message: 'No matching users to notify',
        sent: 0,
      });
    }
    
    // Send notifications in batches (FCM limit is 500 tokens per request)
    const batchSize = 500;
    let totalSent = 0;
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      
      try {
        const response = await sendMulticastNotification(batch, {
          title,
          body: messageBody,
          data: {
            airdrop_id,
            exchange: airdrop.exchange,
            risk_score: String(airdrop.risk_score),
          },
        });
        
        totalSent += response.successCount;
      } catch (error) {
        console.error('Error sending notification batch:', error);
      }
    }
    
    return NextResponse.json({
      message: 'Notifications sent',
      sent: totalSent,
      total: tokens.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

