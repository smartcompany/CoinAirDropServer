import axios from 'axios';
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

export class OkxCrawler implements ExchangeCrawler {
  name = 'okx';
  private baseUrl = 'https://www.okx.com/support/hc/en-us/sections/115000447632';
  
  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting OKX crawler...');
      
      // OKX 공지사항 페이지 스크래핑
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000,
      });

      // HTML 파싱 (간단한 방식)
      const html = response.data;
      
      // 공지사항 제목들을 추출하는 간단한 정규식
      const titleMatches = html.match(/<a[^>]*class="[^"]*article-link[^"]*"[^>]*>([^<]+)<\/a>/g) || [];
      
      for (const match of titleMatches.slice(0, 10)) { // 최대 10개만 처리
        try {
          const titleMatch = match.match(/>([^<]+)</);
          if (!titleMatch) continue;
          
          const title = titleMatch[1].trim();
          const link = match.find('a').attr('href');

          const targetUrl = buildFullUrl(this.baseUrl, link);
          // Check if it's airdrop-related
          if (!isAirdropRelated(title)) {
            continue;
          }
          const airdropData: AirdropData = {
            exchange: 'okx',
            token: extractTokenName(title),
            title: title,
            content: title, // 제목만으로는 내용이 부족하므로 제목을 내용으로 사용
            summary: generateSummary(title),
            source_url: this.baseUrl,
            target_url: targetUrl, // Same as source_url for OKX
            risk_score: 0,
            snapshot_time: extractSnapshotTime(title),
            kyc_required: detectKYC(title),
            verified: true,
            post_date: new Date().toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          
          console.log(`Found OKX airdrop: ${title}`);
          
        } catch (err) {
          const error = `Error processing OKX notice: ${err}`;
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
      console.error('OKX crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`OKX crawler failed: ${error}`],
      };
    }
  }
}
