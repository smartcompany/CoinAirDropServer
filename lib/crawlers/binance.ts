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

export class BinanceCrawler implements ExchangeCrawler {
  name = 'binance';
  private baseUrl = 'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query';
  
  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Binance crawler...');
      
      // Binance API for announcements
      const response = await axios.post(this.baseUrl, {
        type: 1, // Announcements
        catalogId: 48, // New Cryptocurrency Listing
        pageNo: 1,
        pageSize: 20,
      });

      const articles = response.data?.data?.catalogs?.[0]?.articles || [];

      for (const article of articles) {
        try {
          const title = article.title || '';
          const releaseDate = article.releaseDate;
          
          // Check if it's airdrop-related
          if (!isAirdropRelated(title)) {
            continue;
          }

          const sourceUrl = `https://www.binance.com/en/support/announcement/${article.code}`;
          
          // Fetch article details
          const detailResponse = await axios.get(
            `https://www.binance.com/bapi/composite/v1/public/cms/article/detail/query`,
            {
              params: { id: article.id }
            }
          );

          const content = detailResponse.data?.data?.content || title;
          const summary = generateSummary(content);
          
          const airdropData: AirdropData = {
            exchange: 'binance',
            token: extractTokenName(title),
            title: title,
            content: content,
            summary: summary,
            source_url: sourceUrl,
            risk_score: 0, // Will be calculated
            snapshot_time: extractSnapshotTime(content),
            kyc_required: detectKYC(content),
            verified: true, // Binance is verified
            post_date: new Date(releaseDate).toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          
          console.log(`Found Binance airdrop: ${title}`);
          
        } catch (err) {
          const error = `Error processing Binance article: ${err}`;
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
      console.error('Binance crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Binance crawler failed: ${error}`],
      };
    }
  }
}

