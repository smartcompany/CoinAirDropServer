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

export class BithumbCrawler implements ExchangeCrawler {
  name = 'bithumb';
  private baseUrl = 'https://feed.bithumb.com/notice';
  
  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Bithumb crawler...');
      
      // Bithumb 공지사항 페이지 스크래핑
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
        timeout: 10000,
      });

      // HTML 파싱 (간단한 방식)
      const html = response.data;
      
      // 공지사항 링크와 제목을 추출하는 정규식
      const linkMatches = html.match(/<a[^>]*href="\/notice\/(\d+)"[^>]*>([^<]+)<\/a>/g) || [];
      
      for (const match of linkMatches.slice(0, 10)) { // 최대 10개만 처리
        try {
          const linkMatch = match.match(/href="\/notice\/(\d+)"[^>]*>([^<]+)</);
          if (!linkMatch) continue;
          
          const noticeId = linkMatch[1];
          const title = linkMatch[2].trim();
          
          // Check if it's airdrop-related
          if (!isAirdropRelated(title)) {
            continue;
          }

          const sourceUrl = 'https://feed.bithumb.com/notice';
          const targetUrl = `https://feed.bithumb.com/notice/${noticeId}`;
          
          const airdropData: AirdropData = {
            exchange: 'bithumb',
            token: extractTokenName(title),
            title: title,
            content: title, // 제목만으로는 내용이 부족하므로 제목을 내용으로 사용
            summary: generateSummary(title),
            source_url: sourceUrl,
            target_url: targetUrl,
            risk_score: 0,
            snapshot_time: extractSnapshotTime(title),
            kyc_required: detectKYC(title),
            verified: true,
            post_date: new Date().toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          
          console.log(`Found Bithumb airdrop: ${title}`);
          
        } catch (err) {
          const error = `Error processing Bithumb notice: ${err}`;
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
      console.error('Bithumb crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Bithumb crawler failed: ${error}`],
      };
    }
  }
}
