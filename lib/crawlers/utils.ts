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

export function buildFullUrl(baseUrl: string, link: string): string {
  if (!link) return baseUrl;
  
  // 이미 절대 URL인 경우
  if (link.startsWith('http')) return link;
  
  // baseUrl이 /로 끝나고 link가 /로 시작하는 경우 중복 제거
  if (baseUrl.endsWith('/') && link.startsWith('/')) {
    return `${baseUrl}${link.substring(1)}`;
  }
  
  // baseUrl이 /로 끝나지 않고 link가 /로 시작하지 않는 경우 / 추가
  if (!baseUrl.endsWith('/') && !link.startsWith('/')) {
    return `${baseUrl}/${link}`;
  }
  
  // 나머지 경우는 그대로 연결
  return `${baseUrl}${link}`;
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
      try {
        // Validate and format the date
        const dateStr = match[1];
        const date = new Date(dateStr);
        
        // Check if date is valid and not too far in the future
        if (isNaN(date.getTime()) || date.getFullYear() > 2030) {
          continue;
        }
        
        return date.toISOString();
      } catch (error) {
        console.warn(`Invalid date format: ${match[1]}`);
        continue;
      }
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

