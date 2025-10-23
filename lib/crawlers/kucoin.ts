import axios from 'axios';
import * as cheerio from 'cheerio';
import { ExchangeCrawler, CrawlerResult, AirdropData } from './types';
import {
  isAirdropRelated,
  calculateRiskScore,
  extractTokenName,
  detectKYC,
  extractSnapshotTime,
  generateSummary,
  buildFullUrl,
} from './utils';

export class KuCoinCrawler implements ExchangeCrawler {
  name = 'kucoin';
  private baseUrl = 'https://www.kucoin.com/news';

  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting KuCoin crawler...');

      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const newsItems = $('.news-item').slice(0, 10);

      newsItems.each((i, element) => {
        try {
          const title = $(element).find('.title').text().trim();
          const link = $(element).find('a').attr('href');
          const content = $(element).find('.summary').text().trim();

          if (!title || !isAirdropRelated(title)) {
            return;
          }

          // 링크가 상대 경로인 경우 절대 경로로 변환
          // 링크가 상대 경로인 경우 절대 경로로 변환
          const targetUrl = buildFullUrl(this.baseUrl, link || '');
          
          const airdropData: AirdropData = {
            exchange: 'kucoin',
            token: extractTokenName(title),
            title: title,
            content: content || title,
            summary: generateSummary(content || title),
            source_url: this.baseUrl,
            target_url: targetUrl, // 실제 공지사항 링크
            risk_score: 0,
            snapshot_time: extractSnapshotTime(title),
            kyc_required: detectKYC(title),
            verified: true,
            post_date: new Date().toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          console.log(`Found KuCoin airdrop: ${title}`);

        } catch (err) {
          const error = `Error processing KuCoin news: ${err}`;
          console.error(error);
          errors.push(error);
        }
      });


      return {
        success: true,
        airdrops,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      console.error('KuCoin crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`KuCoin crawler failed: ${error}`],
      };
    }
  }
}
