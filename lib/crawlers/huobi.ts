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
} from './utils';

export class HuobiCrawler implements ExchangeCrawler {
  name = 'huobi';
  private baseUrl = 'https://www.htx.com/support';

  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Huobi crawler...');

      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // HTX 공지사항 링크를 찾기 (실제 페이지 구조에 맞게)
      const announcementLinks = $('a').filter((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        return Boolean(href && text && href.includes('/announcement/') && text.length > 10);
      }).slice(0, 10);

      announcementLinks.each((i, element) => {
        try {
          const title = $(element).text().trim();
          const link = $(element).attr('href');
          
          if (!title || !isAirdropRelated(title)) {
            return;
          }

          // 링크가 상대 경로인 경우 절대 경로로 변환
          const fullUrl = link?.startsWith('http') ? link : `https://www.htx.com${link}`;
          
          const airdropData: AirdropData = {
            exchange: 'huobi',
            token: extractTokenName(title),
            title: title,
            content: title, // 제목만으로는 내용이 부족하므로 제목을 내용으로 사용
            summary: generateSummary(title),
            source_url: this.baseUrl,
            target_url: fullUrl, // 실제 공지사항 링크
            risk_score: 0,
            snapshot_time: extractSnapshotTime(title),
            kyc_required: detectKYC(title),
            verified: true,
            post_date: new Date().toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          console.log(`Found Huobi airdrop: ${title}`);

        } catch (err) {
          const error = `Error processing Huobi announcement: ${err}`;
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
      console.error('Huobi crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Huobi crawler failed: ${error}`],
      };
    }
  }
}
