
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

export const getEmotionColor = (emotion: string | null) => {
  if (!emotion) return null;

  switch (emotion.toLowerCase()) {
    case 'positive':
      return {
        bg: "bg-[#FF9A76]", // Darker Peach
        indicator: "bg-[#FF9A76]",
        border: "border-[#FF9A76]"
      };
    case 'negative':
      return {
        bg: "bg-[#9C7AF6]", // Darker Purple
        indicator: "bg-[#9C7AF6]",
        border: "border-[#9C7AF6]"
      };
    case 'neutral':
      return {
        bg: "bg-[#5B9EFF]", // Darker Blue
        indicator: "bg-[#5B9EFF]",
        border: "border-[#5B9EFF]"
      };
    default:
      return null;
  }
};
