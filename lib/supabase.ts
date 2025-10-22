import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Database = {
  public: {
    Tables: {
      airdrops: {
        Row: {
          id: string;
          exchange: string;
          token: string | null;
          title: string;
          content: string;
          summary: string | null;
          source_url: string;
          risk_score: number;
          snapshot_time: string | null;
          kyc_required: boolean;
          verified: boolean;
          post_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['airdrops']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['airdrops']['Insert']>;
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          exchanges: string[];
          chains: string[];
          min_reward: number | null;
          max_risk_level: number;
          push_enabled: boolean;
          fcm_token: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      scam_reports: {
        Row: {
          id: string;
          airdrop_id: string;
          user_id: string;
          reason: string;
          created_at: string;
        };
      };
    };
  };
};

