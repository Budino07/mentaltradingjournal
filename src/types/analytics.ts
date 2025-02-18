
export interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  session_type: "pre" | "post" | "trade";
  emotion: string;
  emotion_detail: string;
  notes: string;
  outcome?: string;
  market_conditions?: string;
  trades?: Trade[];
  followed_rules?: string[];
  mistakes?: string[];
  post_submission_notes?: string;
  pre_trading_activities?: string[];
}

export interface Trade {
  id?: string;
  instrument?: string;
  direction?: 'buy' | 'sell';
  entryDate?: string;
  exitDate?: string;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity?: number;
  fees?: number;
  setup?: string;
  pnl?: number | string;
  profit_loss?: number | string;
  forecastScreenshot?: string;
  resultScreenshot?: string;
  htfBias?: string;
}

export interface AssetPairStats {
  profit: number;
  loss: number;
  total: number;
}

export interface EmotionStats {
  count: number;
  loss: number;
}

export interface AnalyticsInsight {
  journalEntries: JournalEntry[];
  performanceByEmotion: {
    positive: number;
    neutral: number;
    negative: number;
  };
  emotionalImpact: {
    winRate: number[];
    dates: string[];
  };
  emotionTrend: Array<{
    date: number;
    pnl: number;
    emotion: string;
    emotionalScore?: number;
    tradingResult?: number;
  }>;
  emotionTrendInsights: {
    improvement: string;
    impact: string;
  };
  mainInsight: string;
  recommendedAction: string;
  dataRequirements: any;
  mistakeFrequencies: Record<string, EmotionStats>;
  assetPairStats: Record<string, AssetPairStats>;
  emotionRecovery: Record<string, number>;
  tradeDurations: any;
  volatilityData: any;
  riskRewardData: any;
}
