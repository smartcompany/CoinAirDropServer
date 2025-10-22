import { NextRequest, NextResponse } from 'next/server';
import { CrawlerManager } from '@/lib/crawlers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Starting crawler via API...');
    
    const manager = new CrawlerManager();
    const result = await manager.runAll();
    
    return NextResponse.json({
      success: true,
      message: 'Crawler completed',
      result,
    });
  } catch (error) {
    console.error('Crawler API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Crawler failed',
        message: String(error),
      },
      { status: 500 }
    );
  }
}

