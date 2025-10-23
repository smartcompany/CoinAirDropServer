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

export class BinanceRssCrawler implements ExchangeCrawler {
  name = 'binance';
  private rssUrl = 'https://www.binance.com/en/support/announcement/rss';
  
  async crawl(): Promise<CrawlerResult> {
    const errors: string[] = [];
    const airdrops: AirdropData[] = [];

    try {
      console.log('Starting Binance RSS crawler...');
      
      // Try RSS feed first
      try {
        const rssResponse = await axios.get(this.rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          timeout: 10000,
        });

        // Parse RSS XML (simplified parsing)
        const rssContent = rssResponse.data;
        const itemMatches = rssContent.match(/<item>[\s\S]*?<\/item>/g) || [];

        for (const item of itemMatches) {
          try {
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
            const descriptionMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

            if (!titleMatch || !linkMatch) continue;

            const title = titleMatch[1];
            const link = linkMatch[1];
            const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
            const description = descriptionMatch ? descriptionMatch[1] : title;

            // Check if it's airdrop-related
            if (!isAirdropRelated(title)) {
              continue;
            }

            const airdropData: AirdropData = {
              exchange: 'binance',
              token: extractTokenName(title),
              title: title,
              content: description,
              summary: generateSummary(description),
              source_url: this.rssUrl,
              target_url: buildFullUrl(this.rssUrl, link), // Use the actual announcement link
              risk_score: 0,
              snapshot_time: extractSnapshotTime(description),
              kyc_required: detectKYC(description),
              verified: true,
              post_date: new Date(pubDate).toISOString(),
            };

            airdropData.risk_score = calculateRiskScore(airdropData);
            airdrops.push(airdropData);
            
            console.log(`Found Binance RSS airdrop: ${title}`);
            
          } catch (err) {
            const error = `Error processing Binance RSS item: ${err}`;
            console.error(error);
            errors.push(error);
          }
        }

        return {
          success: true,
          airdrops,
          errors: errors.length > 0 ? errors : undefined,
        };

      } catch (rssError) {
        console.warn('RSS feed failed, trying alternative approach:', rssError);
        errors.push(`RSS feed failed: ${rssError}`);
      }

      return {
        success: true,
        airdrops,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      console.error('Binance RSS crawler failed:', error);
      return {
        success: false,
        airdrops: [],
        errors: [`Binance RSS crawler failed: ${error}`],
      };
    }
  }
}
