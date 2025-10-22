-- Airdrop Radar Database Schema

-- Create airdrops table
CREATE TABLE IF NOT EXISTS airdrops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange VARCHAR(50) NOT NULL,
  token VARCHAR(50),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  source_url VARCHAR(1000) NOT NULL UNIQUE,
  risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  snapshot_time TIMESTAMP WITH TIME ZONE,
  kyc_required BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  post_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for airdrops
CREATE INDEX idx_airdrops_exchange ON airdrops(exchange);
CREATE INDEX idx_airdrops_verified ON airdrops(verified);
CREATE INDEX idx_airdrops_post_date ON airdrops(post_date DESC);
CREATE INDEX idx_airdrops_risk_score ON airdrops(risk_score);
CREATE INDEX idx_airdrops_created_at ON airdrops(created_at DESC);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL UNIQUE,
  exchanges TEXT[] DEFAULT ARRAY['binance', 'bybit', 'upbit', 'bithumb'],
  chains TEXT[] DEFAULT ARRAY[]::TEXT[],
  min_reward DECIMAL(18, 8),
  max_risk_level INTEGER DEFAULT 70 CHECK (max_risk_level >= 0 AND max_risk_level <= 100),
  push_enabled BOOLEAN DEFAULT true,
  fcm_token VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_push_enabled ON user_preferences(push_enabled);

-- Create scam_reports table
CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scam_reports
CREATE INDEX idx_scam_reports_airdrop_id ON scam_reports(airdrop_id);
CREATE INDEX idx_scam_reports_created_at ON scam_reports(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_airdrops_updated_at
  BEFORE UPDATE ON airdrops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for airdrops (public read, service role write)
CREATE POLICY "Allow public read access to airdrops"
  ON airdrops FOR SELECT
  USING (true);

CREATE POLICY "Allow service role to insert airdrops"
  ON airdrops FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update airdrops"
  ON airdrops FOR UPDATE
  USING (true);

-- Create policies for user_preferences (users can only manage their own)
CREATE POLICY "Users can read their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

-- Create policies for scam_reports
CREATE POLICY "Users can read their own reports"
  ON scam_reports FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert reports"
  ON scam_reports FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

