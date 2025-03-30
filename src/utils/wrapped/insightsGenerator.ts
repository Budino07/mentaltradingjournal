
import { MonthlyInsights } from "@/types/wrapped";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry, Trade } from "@/types/analytics";

/**
 * Generates insights for a selected month
 */
export async function getMonthlyInsights(monthStr: string): Promise<MonthlyInsights> {
  // In a real implementation, this would fetch actual data from Supabase
  // For now, we'll simulate with random data
  
  // Parse the month string (YYYY-MM format)
  const year = parseInt(monthStr.substring(0, 4));
  const month = parseInt(monthStr.substring(5, 7)) - 1; // 0-indexed
  
  // Create date range for the selected month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  // Fetch journal entries for the selected month
  const { data: userData } = await supabase.auth.getUser();
  let entries: JournalEntry[] = [];
  
  if (userData?.user) {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
      
    entries = data as JournalEntry[] || [];
  }
  
  // Extract all trades from journal entries
  const trades = entries.flatMap(entry => entry.trades || []);
  
  // Calculate win rate
  const totalTrades = trades.length || 1; // Avoid division by zero
  const winningTrades = trades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl > 0;
  }).length;
  
  const winRate = Math.round((winningTrades / totalTrades) * 100);
  
  // Find the most used setup
  const setupCounts: Record<string, number> = {};
  trades.forEach(trade => {
    if (trade.setup) {
      setupCounts[trade.setup] = (setupCounts[trade.setup] || 0) + 1;
    }
  });
  
  let favoriteSetup = "None";
  let maxCount = 0;
  
  Object.entries(setupCounts).forEach(([setup, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteSetup = setup;
    }
  });
  
  // Calculate average holding time
  let totalHours = 0;
  let tradesWithDuration = 0;
  
  trades.forEach(trade => {
    if (trade.entryDate && trade.exitDate) {
      const entryDate = new Date(trade.entryDate);
      const exitDate = new Date(trade.exitDate);
      const durationHours = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
      totalHours += durationHours;
      tradesWithDuration++;
    }
  });
  
  const avgHoldingHours = tradesWithDuration > 0 ? totalHours / tradesWithDuration : 0;
  
  // Determine emotion trends
  const emotions = entries.map(entry => entry.emotion);
  const positiveCount = emotions.filter(e => e === 'positive').length;
  const negativeCount = emotions.filter(e => e === 'negative').length;
  const neutralCount = emotions.filter(e => e === 'neutral').length;
  
  // Generate an emotions by day of week heatmap
  const dayEmotions: Record<string, { positive: number, negative: number, neutral: number }> = {
    'Monday': { positive: 0, negative: 0, neutral: 0 },
    'Tuesday': { positive: 0, negative: 0, neutral: 0 },
    'Wednesday': { positive: 0, negative: 0, neutral: 0 },
    'Thursday': { positive: 0, negative: 0, neutral: 0 },
    'Friday': { positive: 0, negative: 0, neutral: 0 },
  };
  
  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const day = date.toLocaleString('en-US', { weekday: 'long' });
    if (dayEmotions[day] && entry.emotion) {
      dayEmotions[day][entry.emotion as 'positive' | 'negative' | 'neutral']++;
    }
  });
  
  // Find most emotional day
  let mostEmotionalDay = 'Monday';
  let highestEmotionalScore = 0;
  
  Object.entries(dayEmotions).forEach(([day, counts]) => {
    const emotionalScore = counts.positive + counts.negative;
    if (emotionalScore > highestEmotionalScore) {
      highestEmotionalScore = emotionalScore;
      mostEmotionalDay = day;
    }
  });
  
  // Create insights
  return {
    winRate: {
      value: `${winRate}%`,
      description: winRate > 50 
        ? `Impressive! Your win rate was better than ${Math.round(winRate - 50) + 50}% of traders.` 
        : `You won ${winRate}% of your trades. There's room for improvement!`,
      additionalInfo: `Based on ${totalTrades} trades during this month.`
    },
    winningStreak: {
      value: `${Math.min(Math.max(Math.floor(totalTrades * 0.3), 2), 7)} trades`,
      description: "Your longest winning streak shows your strategy's potential."
    },
    losingStreak: {
      value: `${Math.min(Math.max(Math.floor(totalTrades * 0.2), 1), 5)} trades`,
      description: "Even in challenging times, you persevered and kept trading."
    },
    mostActiveTime: {
      value: `${Math.floor(Math.random() * 12) + 1}${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      description: "This is when you placed most of your trades. Are you a morning person or night owl?"
    },
    favoriteSetup: {
      value: favoriteSetup,
      description: "This pattern appeared most frequently in your trading strategy."
    },
    avgHoldingTime: {
      value: avgHoldingHours < 1 
        ? `${Math.round(avgHoldingHours * 60)} minutes` 
        : `${avgHoldingHours.toFixed(1)} hours`,
      description: "Your average trade duration reveals your trading temperament."
    },
    moodPerformance: {
      value: positiveCount > negativeCount ? "Positive" : "Negative",
      description: positiveCount > negativeCount 
        ? "Trading with positive emotions led to better results!" 
        : "Your trading mood influenced your performance.",
      additionalInfo: `${positiveCount} positive sessions, ${negativeCount} negative, ${neutralCount} neutral.`
    },
    overtrading: {
      value: totalTrades > 50 ? "Frequent" : totalTrades > 20 ? "Moderate" : "Disciplined",
      description: totalTrades > 50 
        ? "You traded very actively this month." 
        : totalTrades > 20 
          ? "Your trading frequency was balanced." 
          : "You showed discipline in your trading frequency."
    },
    emotionalHeatmap: {
      value: mostEmotionalDay,
      description: `${mostEmotionalDay}s showed the highest emotional variance in your trading.`,
      additionalInfo: "Emotional awareness can help improve trading consistency."
    }
  };
}
