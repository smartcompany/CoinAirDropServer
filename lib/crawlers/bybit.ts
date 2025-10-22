import axios from 'axios';
import { ExchangeCrawler, CrawlerResult, AirdropData } from './types';
import {
  isAirdropRelated,
  calculateRiskScore,
  extractTokenName,
  detectKYC,
  extractSnapshotTime,
  generateSummary,
} from './utils';

export class BybitCrawler implements ExchangeCrawler {
  name = 'bybit';
  private baseUrl = 'https://api.bybit.com/v5/announcements/index';
  
  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Bybit crawler...');
      
      // Bybit announcements API
      const response = await axios.get(this.baseUrl, {
        params: {
          locale: 'en-US',
          page: 1,
          limit: 20,
        },
      });

      const announcements = response.data?.result?.list || [];

      for (const announcement of announcements) {
        try {
          const title = announcement.title || '';
          const publishTime = announcement.dateTimestamp;
          
          // Check if it's airdrop-related
          if (!isAirdropRelated(title)) {
            continue;
          }

          const sourceUrl = `https://announcements.bybit.com/en-US/article/${announcement.id}`;
          
          // Use description as content (full content would require additional scraping)
          const content = announcement.description || title;
          const summary = generateSummary(content);
          
          const airdropData: AirdropData = {
            exchange: 'bybit',
            token: extractTokenName(title),
            title: title,
            content: content,
            summary: summary,
            source_url: sourceUrl,
            risk_score: 0, // Will be calculated
            snapshot_time: extractSnapshotTime(content),
            kyc_required: detectKYC(content),
            verified: true, // Bybit is verified
            post_date: new Date(publishTime * 1000).toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          
          console.log(`Found Bybit airdrop: ${title}`);
          
        } catch (err) {
          const error = `Error processing Bybit announcement: ${err}`;
          console.error(error);
          errors.push(error);
        }
      }

      return {
        success: true,
        airdrops,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      console.error('Bybit crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Bybit crawler failed: ${error}`],
      };
    }
  }
}

