import { AirdropData } from './types';

// Keywords to detect airdrop announcements
const AIRDROP_KEYWORDS = [
  'airdrop',
  'reward',
  'distribution',
  'giveaway',
  'token distribution',
  '에어드랍',
  '에어드롭',
  '보상',
  '배포',
];

export function isAirdropRelated(text: string): boolean {
  const lowerText = text.toLowerCase();
  return AIRDROP_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Calculate risk score based on various factors
export function calculateRiskScore(data: Partial<AirdropData>): number {
  let score = 50; // Default medium risk

  // Lower risk if from verified exchanges
  if (data.exchange && ['binance', 'bybit', 'upbit', 'bithumb'].includes(data.exchange.toLowerCase())) {
    score -= 20;
  }

  // Higher risk if KYC not required
  if (data.kyc_required === false) {
    score += 10;
  }

  // Lower risk if snapshot time is clear
  if (data.snapshot_time) {
    score -= 10;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Extract token name from title
export function extractTokenName(title: string): string | null {
  // Try to extract token symbol (usually in uppercase, 2-10 chars)
  const match = title.match(/\b([A-Z]{2,10})\b/);
  return match ? match[1] : null;
}

// Detect if KYC is mentioned
export function detectKYC(text: string): boolean {
  const kycKeywords = ['kyc', 'know your customer', 'verification', '신원확인', '본인인증'];
  const lowerText = text.toLowerCase();
  return kycKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Extract snapshot date from text
export function extractSnapshotTime(text: string): string | null {
  // Look for date patterns
  const datePatterns = [
    /snapshot.*?(\d{4}[-/]\d{2}[-/]\d{2})/i,
    /(\d{4}[-/]\d{2}[-/]\d{2}).*?snapshot/i,
    /스냅샷.*?(\d{4}[-년]\d{2}[-월]\d{2}일?)/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Generate summary from content
export function generateSummary(content: string, maxLength: number = 200): string {
  const cleaned = content.replace(/<[^>]*>/g, '').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength) + '...';
}

