
import { Trade } from "@/types/trade";

export const calculateDayStats = (entries: Array<{ trades?: Trade[], emotion?: string, session_type?: string }>) => {
  if (entries.length === 0) return null;

  // Create a Map to store unique trades with their latest values
  const tradeMap = new Map<string, Trade>();
  
  // Process all trades, keeping only the latest version of each trade
  entries.forEach(entry => {
    if (entry.trades && entry.trades.length > 0) {
      entry.trades.forEach(trade => {
        if (trade && trade.id) {
          // Always keep the latest version of the trade
          tradeMap.set(trade.id, trade);
        }
      });
    }
  });

  // Calculate totals using only unique trades
  let totalPL = 0;
  let totalTrades = 0;

  tradeMap.forEach(trade => {
    totalTrades++;
    const pnlValue = trade.pnl || trade.profit_loss || 0;
    const numericPnL = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
    totalPL += isNaN(numericPnL) ? 0 : numericPnL;
  });

  // Find pre-session emotion if it exists
  let preSessionEmotion = null;
  for (const entry of entries) {
    if (entry.session_type === 'pre' && entry.emotion) {
      preSessionEmotion = entry.emotion;
      break;
    }
  }

  return {
    totalPL,
    numTrades: totalTrades,
    preSessionEmotion
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getEmotionStyle = (stats: { totalPL: number } | null) => {
  if (!stats) return null;

  if (stats.totalPL === 0) {
    return {
      bg: "bg-gray-50 dark:bg-gray-800/30",
      border: "border-gray-200 dark:border-gray-700",
      shadow: "shadow-gray-100/50 dark:shadow-gray-900/50",
    };
  }

  if (stats.totalPL > 0) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-500 dark:border-emerald-500",
      shadow: "shadow-emerald-100/50 dark:shadow-emerald-900/50",
    };
  }

  return {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-500 dark:border-red-500",
    shadow: "shadow-red-100/50 dark:shadow-red-900/50",
  };
};

export const getEmotionColor = (emotion: string | null, mode: 'emotion' | 'performance' = 'emotion') => {
  if (!emotion) return null;

  // Always return a neutral border in emotion mode
  if (mode === 'emotion') {
    return {
      border: "border-gray-200 dark:border-gray-600",
      text: emotion.toLowerCase() === 'positive' 
        ? "text-[#FEC6A1]" 
        : emotion.toLowerCase() === 'negative' 
          ? "text-[#9b87f5]" 
          : "text-blue-600 dark:text-blue-300"
    };
  }

  // Performance mode remains unchanged
  return {
    border: "border-gray-200 dark:border-gray-600",
    text: "text-gray-600 dark:text-gray-300"
  };
};

export const getBorderColor = (amount: number | null, mode: 'emotion' | 'performance' = 'emotion', emotionColors: { border: string } | null = null) => {
  // Only use neutral border for emotion mode
  if (mode === 'emotion') {
    return 'border-gray-200 dark:border-gray-700';
  }
  
  // In performance mode, use P&L-based colored borders
  if (!amount) return 'border-gray-200 dark:border-gray-700';
  
  // More vibrant border colors for performance mode
  if (amount > 0) return 'border-emerald-500 dark:border-emerald-500';
  if (amount < 0) return 'border-red-500 dark:border-red-500';
  
  return 'border-gray-200 dark:border-gray-700';
};

export const getPnLColor = (amount: number, mode: 'emotion' | 'performance' = 'emotion') => {
  if (amount === 0) return 'text-gray-500 dark:text-gray-400';
  
  if (mode === 'performance') {
    // More vibrant colors for performance mode
    return amount > 0 
      ? 'text-emerald-600 dark:text-emerald-400' 
      : 'text-red-500 dark:text-red-400';
  } else {
    // Subtle colors for emotion mode
    return amount > 0 
      ? 'text-emerald-600/80 dark:text-emerald-400/80' 
      : 'text-red-500/80 dark:text-red-400/80';
  }
};
