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

export class UpbitCrawler implements ExchangeCrawler {
  name = 'upbit';
  private baseUrl = 'https://api-manager.upbit.com/api/v1/notices';
  
  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Upbit crawler...');
      
      // Upbit 공지사항 API
      const response = await axios.get(this.baseUrl, {
        params: {
          page: 1,
          per_page: 20,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      const notices = response.data?.data || [];

      for (const notice of notices) {
        try {
          const title = notice.title || '';
          const createdAt = notice.created_at;
          
          // Check if it's airdrop-related
          if (!isAirdropRelated(title)) {
            continue;
          }

          const sourceUrl = `https://upbit.com/service_center/notice?id=${notice.id}`;
          
          // Use content as description
          const content = notice.content || title;
          const summary = generateSummary(content);
          
          const airdropData: AirdropData = {
            exchange: 'upbit',
            token: extractTokenName(title),
            title: title,
            content: content,
            summary: summary,
            source_url: sourceUrl,
            target_url: sourceUrl, // Same as source_url for Upbit
            risk_score: 0,
            snapshot_time: extractSnapshotTime(content),
            kyc_required: detectKYC(content),
            verified: true,
            post_date: new Date(createdAt).toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          
          console.log(`Found Upbit airdrop: ${title}`);
          
        } catch (err) {
          const error = `Error processing Upbit notice: ${err}`;
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
      console.error('Upbit crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Upbit crawler failed: ${error}`],
      };
    }
  }
}
