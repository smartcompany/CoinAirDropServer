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

export class CoinbaseCrawler implements ExchangeCrawler {
  name = 'coinbase';
  private baseUrl = 'https://blog.coinbase.com';

  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Coinbase crawler...');

      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const articles = $('article').slice(0, 10);

      articles.each((i, element) => {
        try {
          const title = $(element).find('h2 a, h3 a').text().trim();
          const link = $(element).find('h2 a, h3 a').attr('href');
          const content = $(element).find('p').text().trim();

          if (!title || !isAirdropRelated(title)) {
            return;
          }

          const airdropData: AirdropData = {
            exchange: 'coinbase',
            token: extractTokenName(title),
            title: title,
            content: content || title,
            summary: generateSummary(content || title),
            source_url: this.baseUrl,
            target_url: link ? `https://blog.coinbase.com${link}` : this.baseUrl,
            risk_score: 0,
            snapshot_time: extractSnapshotTime(content || title),
            kyc_required: detectKYC(content || title),
            verified: true,
            post_date: new Date().toISOString(),
          };

          airdropData.risk_score = calculateRiskScore(airdropData);
          airdrops.push(airdropData);
          console.log(`Found Coinbase airdrop: ${title}`);

        } catch (err) {
          const error = `Error processing Coinbase article: ${err}`;
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
      console.error('Coinbase crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Coinbase crawler failed: ${error}`],
      };
    }
  }
}
