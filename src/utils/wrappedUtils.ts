
import { format, parseISO, getMonth, getYear } from "date-fns";
import { JournalEntry, Trade } from "@/types/analytics";

export type WrappedMonth = {
  month: string;
  year: number;
  hasData: boolean;
};

export type WrappedInsight = {
  id: string;
  title: string;
  description: string;
  value: string | number;
  icon: string;
  color: string;
  type: 'performance' | 'psychology';
  animation: 'fade' | 'scale' | 'slide' | 'bounce';
};

export const getAvailableMonths = (journalEntries: JournalEntry[]): WrappedMonth[] => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Create a map to track which months have data
  const monthsWithData = new Map<string, boolean>();
  
  // Process entries to mark months with data
  journalEntries.forEach(entry => {
    const date = parseISO(entry.created_at);
    const month = getMonth(date);
    const year = getYear(date);
    const key = `${year}-${month}`;
    
    monthsWithData.set(key, true);
  });
  
  // Generate all months from the beginning of the year to current month
  const availableMonths: WrappedMonth[] = [];
  
  for (let year = currentYear; year >= currentYear - 1; year--) {
    const monthLimit = year === currentYear ? currentMonth : 11;
    
    for (let month = monthLimit; month >= 0; month--) {
      const key = `${year}-${month}`;
      availableMonths.push({
        month: format(new Date(year, month, 1), 'MMMM'),
        year,
        hasData: monthsWithData.has(key)
      });
    }
  }
  
  return availableMonths;
};

export const generateMonthlyInsights = (
  journalEntries: JournalEntry[], 
  selectedMonth: number, 
  selectedYear: number
): WrappedInsight[] => {
  // Filter entries for the selected month and year
  const monthEntries = journalEntries.filter(entry => {
    const date = parseISO(entry.created_at);
    return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
  });
  
  if (monthEntries.length === 0) {
    return [];
  }
  
  // Extract all trades from the month's entries
  const allTrades: Trade[] = monthEntries.flatMap(entry => entry.trades || []);
  
  // Calculate win rate
  const winningTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl > 0;
  });
  
  const winRate = allTrades.length > 0 
    ? Math.round((winningTrades.length / allTrades.length) * 100) 
    : 0;
  
  // Find winning/losing streaks
  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let currentStreakType: 'win' | 'lose' | null = null;
  
  // Sort trades by date
  const sortedTrades = [...allTrades].sort((a, b) => {
    const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0;
    const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0;
    return dateA - dateB;
  });
  
  sortedTrades.forEach(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    const isWin = pnl > 0;
    
    if (currentStreakType === null) {
      currentStreakType = isWin ? 'win' : 'lose';
      currentStreak = 1;
    } else if ((isWin && currentStreakType === 'win') || (!isWin && currentStreakType === 'lose')) {
      currentStreak++;
    } else {
      // Streak ended
      if (currentStreakType === 'win') {
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else {
        maxLoseStreak = Math.max(maxLoseStreak, currentStreak);
      }
      
      currentStreakType = isWin ? 'win' : 'lose';
      currentStreak = 1;
    }
  });
  
  // Check final streak
  if (currentStreakType === 'win') {
    maxWinStreak = Math.max(maxWinStreak, currentStreak);
  } else if (currentStreakType === 'lose') {
    maxLoseStreak = Math.max(maxLoseStreak, currentStreak);
  }
  
  // Calculate average trade holding time
  const tradesWithDuration = allTrades.filter(trade => trade.entryDate && trade.exitDate);
  
  let avgHoldingTimeHours = 0;
  if (tradesWithDuration.length > 0) {
    const totalHours = tradesWithDuration.reduce((total, trade) => {
      const entryDate = new Date(trade.entryDate!);
      const exitDate = new Date(trade.exitDate!);
      const durationMs = exitDate.getTime() - entryDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      return total + durationHours;
    }, 0);
    
    avgHoldingTimeHours = totalHours / tradesWithDuration.length;
  }
  
  // Find most profitable setup
  const setupPerformance = allTrades.reduce((acc, trade) => {
    const setup = trade.setup || 'Unknown';
    if (!acc[setup]) {
      acc[setup] = { count: 0, totalPnl: 0 };
    }
    
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    acc[setup].count++;
    acc[setup].totalPnl += pnl;
    
    return acc;
  }, {} as Record<string, { count: number; totalPnl: number }>);
  
  let favoriteSetup = 'None';
  let highestCount = 0;
  
  Object.entries(setupPerformance).forEach(([setup, data]) => {
    if (data.count > highestCount) {
      favoriteSetup = setup;
      highestCount = data.count;
    }
  });
  
  let mostProfitableSetup = 'None';
  let highestPnl = 0;
  
  Object.entries(setupPerformance).forEach(([setup, data]) => {
    if (data.totalPnl > highestPnl) {
      mostProfitableSetup = setup;
      highestPnl = data.totalPnl;
    }
  });
  
  // Calculate mood vs performance
  const preSessions = monthEntries.filter(entry => entry.session_type === 'pre');
  
  const moodPerformance = preSessions.reduce((acc, preSession) => {
    const date = format(parseISO(preSession.created_at), 'yyyy-MM-dd');
    const mood = preSession.emotion || 'neutral';
    
    // Find trades on this date
    const dayTrades = allTrades.filter(trade => 
      trade.entryDate && trade.entryDate.startsWith(date)
    );
    
    if (dayTrades.length > 0) {
      if (!acc[mood]) {
        acc[mood] = { totalTrades: 0, winningTrades: 0 };
      }
      
      acc[mood].totalTrades += dayTrades.length;
      
      const winningTradesCount = dayTrades.filter(trade => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
        return pnl > 0;
      }).length;
      
      acc[mood].winningTrades += winningTradesCount;
    }
    
    return acc;
  }, {} as Record<string, { totalTrades: number; winningTrades: number }>);
  
  // Generate insights array
  const insights: WrappedInsight[] = [
    {
      id: 'win-rate',
      title: 'Monthly Win Rate',
      description: 'How often your trades ended in profit this month',
      value: `${winRate}%`,
      icon: '🎯',
      color: 'bg-green-500',
      type: 'performance',
      animation: 'scale'
    },
    {
      id: 'win-streak',
      title: 'Biggest Winning Streak',
      description: 'Your longest consecutive winning trades',
      value: maxWinStreak,
      icon: '🔥',
      color: 'bg-orange-500',
      type: 'performance',
      animation: 'slide'
    },
    {
      id: 'lose-streak',
      title: 'Longest Drawdown',
      description: 'Your longest consecutive losing trades',
      value: maxLoseStreak,
      icon: '📉',
      color: 'bg-blue-500',
      type: 'performance',
      animation: 'fade'
    },
    {
      id: 'holding-time',
      title: 'Average Holding Time',
      description: 'How long you typically stay in trades',
      value: `${avgHoldingTimeHours.toFixed(1)} hours`,
      icon: '⏱️',
      color: 'bg-purple-500',
      type: 'performance',
      animation: 'bounce'
    },
    {
      id: 'favorite-setup',
      title: 'Most Used Setup',
      description: 'Your go-to trading strategy',
      value: favoriteSetup,
      icon: '🎭',
      color: 'bg-indigo-500',
      type: 'performance',
      animation: 'fade'
    },
    {
      id: 'profitable-setup',
      title: 'Most Profitable Setup',
      description: 'Trading strategy with highest returns',
      value: mostProfitableSetup,
      icon: '💰',
      color: 'bg-yellow-500',
      type: 'performance',
      animation: 'scale'
    }
  ];
  
  // Add mood insights if we have mood data
  Object.entries(moodPerformance).forEach(([mood, data]) => {
    const moodWinRate = data.totalTrades > 0 
      ? Math.round((data.winningTrades / data.totalTrades) * 100) 
      : 0;
    
    let moodIcon = '😐';
    if (mood === 'positive') moodIcon = '😊';
    if (mood === 'negative') moodIcon = '😞';
    
    insights.push({
      id: `mood-${mood}`,
      title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood Performance`,
      description: `Win rate when feeling ${mood}`,
      value: `${moodWinRate}%`,
      icon: moodIcon,
      color: mood === 'positive' ? 'bg-green-400' : mood === 'negative' ? 'bg-red-400' : 'bg-gray-400',
      type: 'psychology',
      animation: 'slide'
    });
  });
  
  return insights;
};
