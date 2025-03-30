
export interface InsightData {
  value: string;
  description: string;
  additionalInfo?: string;
}

export interface MonthlyInsights {
  winRate: InsightData;
  winningStreak: InsightData;
  losingStreak: InsightData;
  mostActiveTime: InsightData;
  favoriteSetup: InsightData;
  avgHoldingTime: InsightData;
  moodPerformance: InsightData;
  overtrading: InsightData;
  emotionalHeatmap: InsightData;
}
