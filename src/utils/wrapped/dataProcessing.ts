
import { formatDate, getTimeFromDate } from "@/utils/dateUtils";

export const processMonthlyData = (entries: any[]): any => {
  if (!entries || entries.length === 0) {
    return defaultMonthData();
  }

  // Extract all trades from entries
  const allTrades = entries.flatMap(entry => 
    entry.trades && Array.isArray(entry.trades) ? entry.trades : []
  );
  
  // Calculate win rate
  const winningTrades = allTrades.filter(trade => 
    (typeof trade.pnl === 'number' && trade.pnl > 0) || 
    (typeof trade.pnl === 'string' && parseFloat(trade.pnl) > 0)
  );
  
  const winRate = allTrades.length > 0 
    ? (winningTrades.length / allTrades.length) * 100 
    : 0;
  
  // Previous month's win rate (placeholder - in a real implementation, you'd fetch this)
  const prevMonthWinRate = Math.random() * 10 - 5; // Random number between -5 and 5 for demo
  
  // Calculate winning and losing streaks
  const streaks = calculateStreaks(allTrades);
  
  // Find most active trading time
  const mostActiveTime = findMostActiveTime(allTrades);
  
  // Find favorite setup
  const favoriteSetup = findFavoriteSetup(allTrades);
  
  // Calculate average holding time
  const avgHoldingTime = calculateAvgHoldingTime(allTrades);
  
  // Calculate mood performance
  const moodPerformance = calculateMoodPerformance(entries);
  
  // Calculate overtrading indicators
  const overtradingDays = calculateOvertradingDays(entries);
  
  // Calculate emotional heatmap
  const emotionalByDay = calculateEmotionalByDay(entries);
  const mostEmotionalDay = findMostEmotionalDay(emotionalByDay);
  
  return {
    winRate,
    prevMonthWinRate,
    winningStreak: streaks.winningStreak,
    losingStreak: streaks.losingStreak,
    mostActiveTime,
    favoriteSetup,
    avgHoldingTime,
    moodPerformance,
    bestMood: findBestMood(moodPerformance),
    bestMoodWinRate: moodPerformance[findBestMood(moodPerformance)] || 0,
    overtradingDays,
    emotionalByDay,
    mostEmotionalDay,
  };
};

const defaultMonthData = () => {
  return {
    winRate: 0,
    prevMonthWinRate: 0,
    winningStreak: 0,
    losingStreak: 0,
    mostActiveTime: "N/A",
    favoriteSetup: "N/A",
    avgHoldingTime: "N/A",
    moodPerformance: { positive: 0, neutral: 0, negative: 0 },
    bestMood: "N/A",
    bestMoodWinRate: 0,
    overtradingDays: 0,
    emotionalByDay: {},
    mostEmotionalDay: "N/A",
  };
};

const calculateStreaks = (trades: any[]) => {
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLoseStreak = 0;
  let maxLoseStreak = 0;
  
  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.entryDate || a.entry_date || 0);
    const dateB = new Date(b.entryDate || b.entry_date || 0);
    return dateA.getTime() - dateB.getTime();
  });
  
  for (const trade of sortedTrades) {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0);
    
    if (pnl > 0) {
      // Winning trade
      currentWinStreak++;
      currentLoseStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (pnl < 0) {
      // Losing trade
      currentLoseStreak++;
      currentWinStreak = 0;
      maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
    } else {
      // Break streak for flat trades
      currentWinStreak = 0;
      currentLoseStreak = 0;
    }
  }
  
  return { winningStreak: maxWinStreak, losingStreak: maxLoseStreak };
};

const findMostActiveTime = (trades: any[]) => {
  const timeSlots: Record<string, number> = {};
  
  trades.forEach(trade => {
    const entryTime = trade.entryDate || trade.entry_date;
    if (!entryTime) return;
    
    const hour = new Date(entryTime).getHours();
    let timeSlot = "";
    
    if (hour >= 4 && hour < 8) timeSlot = "Early Morning (4-8 AM)";
    else if (hour >= 8 && hour < 12) timeSlot = "Morning (8-12 PM)";
    else if (hour >= 12 && hour < 16) timeSlot = "Afternoon (12-4 PM)";
    else if (hour >= 16 && hour < 20) timeSlot = "Evening (4-8 PM)";
    else timeSlot = "Night (8 PM-4 AM)";
    
    timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1;
  });
  
  let mostActiveTime = "N/A";
  let maxCount = 0;
  
  Object.entries(timeSlots).forEach(([time, count]) => {
    if (count > maxCount) {
      mostActiveTime = time;
      maxCount = count;
    }
  });
  
  return mostActiveTime;
};

const findFavoriteSetup = (trades: any[]) => {
  const setups: Record<string, { count: number, profit: number }> = {};
  
  trades.forEach(trade => {
    const setup = trade.setup || "Unknown";
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0);
    
    if (!setups[setup]) {
      setups[setup] = { count: 0, profit: 0 };
    }
    
    setups[setup].count++;
    setups[setup].profit += pnl;
  });
  
  let favoriteSetup = "N/A";
  let maxProfit = -Infinity;
  
  Object.entries(setups).forEach(([setup, data]) => {
    if (data.profit > maxProfit) {
      favoriteSetup = setup;
      maxProfit = data.profit;
    }
  });
  
  return favoriteSetup;
};

const calculateAvgHoldingTime = (trades: any[]) => {
  if (trades.length === 0) return "N/A";
  
  let totalDurationMinutes = 0;
  let tradesWithDuration = 0;
  
  trades.forEach(trade => {
    const entryDate = trade.entryDate || trade.entry_date;
    const exitDate = trade.exitDate || trade.exit_date;
    
    if (entryDate && exitDate) {
      const durationMs = new Date(exitDate).getTime() - new Date(entryDate).getTime();
      const durationMinutes = durationMs / (1000 * 60);
      
      if (durationMinutes > 0) {
        totalDurationMinutes += durationMinutes;
        tradesWithDuration++;
      }
    }
  });
  
  if (tradesWithDuration === 0) return "N/A";
  
  const avgMinutes = totalDurationMinutes / tradesWithDuration;
  
  // Format the duration
  if (avgMinutes < 60) {
    return `${Math.round(avgMinutes)} minutes`;
  } else if (avgMinutes < 1440) {
    return `${Math.round(avgMinutes / 60)} hours`;
  } else {
    return `${Math.round(avgMinutes / 1440)} days`;
  }
};

const calculateMoodPerformance = (entries: any[]) => {
  const moodPerformance: Record<string, number> = {
    positive: 0,
    neutral: 0, 
    negative: 0
  };
  
  const moodTrades: Record<string, { wins: number, total: number }> = {
    positive: { wins: 0, total: 0 },
    neutral: { wins: 0, total: 0 },
    negative: { wins: 0, total: 0 }
  };
  
  // Group entries by date
  const entriesByDate: Record<string, any[]> = {};
  
  entries.forEach(entry => {
    const date = formatDate(new Date(entry.created_at));
    
    if (!entriesByDate[date]) {
      entriesByDate[date] = [];
    }
    
    entriesByDate[date].push(entry);
  });
  
  // Process trades for each day
  Object.values(entriesByDate).forEach(dayEntries => {
    // Find the pre-session entry for the day
    const preSession = dayEntries.find(entry => entry.session_type === 'pre');
    
    if (!preSession) return;
    
    const mood = preSession.emotion || 'neutral';
    
    // Process all trades for the day
    dayEntries.forEach(entry => {
      if (!entry.trades || !Array.isArray(entry.trades)) return;
      
      entry.trades.forEach((trade: any) => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0);
        
        moodTrades[mood].total++;
        
        if (pnl > 0) {
          moodTrades[mood].wins++;
        }
      });
    });
  });
  
  // Calculate win rates
  Object.entries(moodTrades).forEach(([mood, data]) => {
    if (data.total > 0) {
      moodPerformance[mood] = (data.wins / data.total) * 100;
    }
  });
  
  return moodPerformance;
};

const findBestMood = (moodPerformance: Record<string, number>) => {
  let bestMood = "neutral";
  let bestRate = 0;
  
  Object.entries(moodPerformance).forEach(([mood, winRate]) => {
    if (winRate > bestRate) {
      bestMood = mood;
      bestRate = winRate;
    }
  });
  
  return bestMood;
};

const calculateOvertradingDays = (entries: any[]) => {
  // Group entries by date
  const tradesByDate: Record<string, number> = {};
  
  entries.forEach(entry => {
    if (!entry.trades || !Array.isArray(entry.trades)) return;
    
    const date = formatDate(new Date(entry.created_at));
    
    tradesByDate[date] = (tradesByDate[date] || 0) + entry.trades.length;
  });
  
  // Calculate average trades per day
  const tradeCounts = Object.values(tradesByDate);
  
  if (tradeCounts.length === 0) return 0;
  
  const avgTradesPerDay = tradeCounts.reduce((sum, count) => sum + count, 0) / tradeCounts.length;
  
  // Count days with trade count exceeding 150% of average
  const overtradingThreshold = avgTradesPerDay * 1.5;
  
  return tradeCounts.filter(count => count > overtradingThreshold).length;
};

const calculateEmotionalByDay = (entries: any[]) => {
  const emotionalByDay: Record<string, Record<string, number>> = {
    Monday: { positive: 0, neutral: 0, negative: 0 },
    Tuesday: { positive: 0, neutral: 0, negative: 0 },
    Wednesday: { positive: 0, neutral: 0, negative: 0 },
    Thursday: { positive: 0, neutral: 0, negative: 0 },
    Friday: { positive: 0, neutral: 0, negative: 0 }
  };
  
  entries.forEach(entry => {
    if (!entry.emotion) return;
    
    const date = new Date(entry.created_at);
    const dayIndex = date.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayIndex === 0 || dayIndex === 6) return;
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = dayNames[dayIndex];
    
    emotionalByDay[day][entry.emotion] = (emotionalByDay[day][entry.emotion] || 0) + 1;
  });
  
  return emotionalByDay;
};

const findMostEmotionalDay = (emotionalByDay: Record<string, Record<string, number>>) => {
  let mostEmotionalDay = "N/A";
  let highestEmotionScore = 0;
  
  Object.entries(emotionalByDay).forEach(([day, emotions]) => {
    // Calculate emotion score - positive and negative are more "emotional" than neutral
    const emotionScore = (emotions.positive || 0) * 1.5 + (emotions.negative || 0) * 2;
    
    if (emotionScore > highestEmotionScore) {
      mostEmotionalDay = day;
      highestEmotionScore = emotionScore;
    }
  });
  
  return mostEmotionalDay;
};
