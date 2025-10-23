import { BinanceRssCrawler } from './binance-rss';
import { BybitCrawler } from './bybit';
import { UpbitCrawler } from './upbit';
import { BithumbCrawler } from './bithumb';
import { OkxCrawler } from './okx';
import { CoinbaseCrawler } from './coinbase';
import { KrakenCrawler } from './kraken';
import { HuobiCrawler } from './huobi';
import { KuCoinCrawler } from './kucoin';
import { supabase } from '../supabase';
import { ExchangeCrawler, CrawlerResult, AirdropData } from './types';

export class CrawlerManager {
  private crawlers: ExchangeCrawler[];

  constructor() {
    this.crawlers = [
      new BinanceRssCrawler(),
      new BybitCrawler(),
      new UpbitCrawler(),
      new BithumbCrawler(),
      new OkxCrawler(),
      new CoinbaseCrawler(),
      new KrakenCrawler(),
      new HuobiCrawler(),
      new KuCoinCrawler(),
    ];
  }

  async runAll(): Promise<{ total: number; saved: number; errors: string[] }> {
    let totalFound = 0;
    let totalSaved = 0;
    const allErrors: string[] = [];

    console.log('Starting all crawlers...');

    for (const crawler of this.crawlers) {
      try {
        console.log(`Running ${crawler.name} crawler...`);
        const result = await crawler.crawl();
        
        totalFound += result.airdrops.length;
        
        if (result.errors) {
          allErrors.push(...result.errors);
        }

        // Save to database
        const saved = await this.saveAirdrops(result.airdrops);
        totalSaved += saved;
        
        console.log(`${crawler.name}: Found ${result.airdrops.length}, Saved ${saved}`);
        
      } catch (error) {
        const errorMsg = `Failed to run ${crawler.name} crawler: ${error}`;
        console.error(errorMsg);
        allErrors.push(errorMsg);
      }
    }

    console.log(`Crawling complete. Total found: ${totalFound}, Total saved: ${totalSaved}`);

    return {
      total: totalFound,
      saved: totalSaved,
      errors: allErrors,
    };
  }

  async saveAirdrops(airdrops: AirdropData[]): Promise<number> {
    let saved = 0;

    for (const airdrop of airdrops) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('airdrops')
          .select('id')
          .eq('source_url', airdrop.source_url)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('airdrops')
            .insert(airdrop);

          if (error) {
            console.error('Error inserting airdrop:', error);
          } else {
            saved++;
          }
        } else {
          console.log(`Airdrop already exists: ${airdrop.title}`);
        }
      } catch (error) {
        console.error('Error saving airdrop:', error);
      }
    }

    return saved;
  }
}

export * from './types';
export { BinanceRssCrawler, BybitCrawler, UpbitCrawler, BithumbCrawler, OkxCrawler, CoinbaseCrawler, KrakenCrawler, HuobiCrawler, KuCoinCrawler };

