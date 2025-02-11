
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsInsight, JournalEntry } from "@/types/analytics";
import { calculateDataRequirements } from "./dataRequirements";
import { processJournalTrades, calculateAssetPairStats } from "./analytics/tradeProcessing";
import { calculateEmotionRecovery, calculateEmotionTrend } from "./analytics/emotionAnalysis";
import { calculateMistakeFrequencies } from "./analytics/mistakeAnalysis";
import { analyzeTradeDurations } from "./analytics/tradeDurationAnalysis";

export const generateAnalytics = async (): Promise<AnalyticsInsight> => {
  console.log('Fetching journal entries...');
  
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }

  console.log('Raw entries:', entries);

  if (!entries || entries.length === 0) {
    console.log('No journal entries found');
    // Return default values when no entries are found
    return {
      journalEntries: [],
      performanceByEmotion: { positive: 0, neutral: 0, negative: 0 },
      emotionalImpact: { winRate: [], dates: [] },
      emotionTrend: [],
      emotionTrendInsights: {
        improvement: 'No data available',
        impact: 'No data available',
      },
      mainInsight: "No journal entries found",
      recommendedAction: "Start journaling to see analytics",
      dataRequirements: calculateDataRequirements([]),
      mistakeFrequencies: {},
      assetPairStats: {},
      emotionRecovery: {},
      tradeDurations: [],
      volatilityData: [],
      riskRewardData: [],
    };
  }

  // Ensure trades array exists and is properly formatted
  const journalEntries = entries.map(entry => ({
    ...entry,
    trades: Array.isArray(entry.trades) ? entry.trades.map(trade => ({
      ...trade,
      pnl: typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
           typeof trade.pnl === 'number' ? trade.pnl : 0
    })) : [],
    session_type: ['pre', 'post', 'trade'].includes(entry.session_type) 
      ? entry.session_type as 'pre' | 'post' | 'trade' 
      : 'pre'
  })) as JournalEntry[];

  console.log('Processed entries:', journalEntries);

  const dataRequirements = calculateDataRequirements(journalEntries);
  const allTrades = processJournalTrades(journalEntries);
  const assetPairStats = calculateAssetPairStats(allTrades);
  const mistakeFrequencies = calculateMistakeFrequencies(journalEntries);
  const emotionRecovery = calculateEmotionRecovery(journalEntries);
  const tradeDurations = analyzeTradeDurations(allTrades);
  const emotionTrend = calculateEmotionTrend(journalEntries);

  // Process market volatility data
  const volatilityData = journalEntries.map(entry => ({
    volatility: entry.market_conditions?.includes('high') ? 75 :
      entry.market_conditions?.includes('medium') ? 50 : 25,
    performance: entry.trades?.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                 typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + pnl;
    }, 0) || 0,
    emotional: entry.emotion
  }));

  // Calculate risk/reward data
  const riskRewardData = allTrades
    .filter(trade => trade.entryPrice && trade.stopLoss && trade.takeProfit)
    .map(trade => ({
      risk: Math.abs(Number(trade.entryPrice) - Number(trade.stopLoss)),
      reward: Math.abs(Number(trade.takeProfit) - Number(trade.entryPrice)),
      size: Number(trade.quantity) || 1,
    }));

  const emotionTrendWithScores = emotionTrend.map(trend => ({
    ...trend,
    emotionalScore: trend.emotion === 'positive' ? 1 : trend.emotion === 'negative' ? -1 : 0,
    tradingResult: trend.pnl
  }));

  // Calculate performance by emotion
  const performanceByEmotion = journalEntries.reduce((acc, entry) => {
    if (entry.trades && entry.trades.length > 0) {
      const totalPnL = entry.trades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                   typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0);

      if (entry.emotion === 'positive') acc.positive += totalPnL;
      else if (entry.emotion === 'neutral') acc.neutral += totalPnL;
      else if (entry.emotion === 'negative') acc.negative += totalPnL;
    }
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  console.log('Analytics generation complete:', {
    entriesCount: journalEntries.length,
    tradesCount: allTrades.length,
    performanceByEmotion,
  });

  return {
    journalEntries,
    performanceByEmotion,
    emotionalImpact: {
      winRate: [],
      dates: [],
    },
    emotionTrend: emotionTrendWithScores,
    emotionTrendInsights: {
      improvement: `Your emotional resilience has ${
        emotionTrendWithScores[emotionTrendWithScores.length - 1]?.emotionalScore > emotionTrendWithScores[0]?.emotionalScore 
          ? 'improved' 
          : 'decreased'
      } over the last month.`,
      impact: `Trading results show ${
        Math.abs(emotionTrendWithScores.reduce((sum, day) => sum + (day.tradingResult || 0), 0))
      }$ impact on your P&L.`,
    },
    mainInsight: "Based on your journal entries, there's a strong correlation between emotional state and trading performance.",
    recommendedAction: "Focus on maintaining emotional balance during trading sessions.",
    dataRequirements,
    mistakeFrequencies,
    assetPairStats,
    emotionRecovery,
    tradeDurations,
    volatilityData,
    riskRewardData,
  };
};
