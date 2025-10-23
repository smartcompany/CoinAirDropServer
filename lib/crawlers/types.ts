export interface AirdropData {
  exchange: string;
  token: string | null;
  title: string;
  content: string;
  summary: string | null;
  source_url: string;
  target_url: string | null;
  risk_score: number;
  snapshot_time: string | null;
  kyc_required: boolean;
  verified: boolean;
  post_date: string;
}

export interface CrawlerResult {
  success: boolean;
  airdrops: AirdropData[];
  errors?: string[];
}

export interface ExchangeCrawler {
  name: string;
  crawl(): Promise<CrawlerResult>;
}

