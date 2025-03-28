
import { Trade } from "@/types/trade";

export const calculateDayStats = (entries: Array<{ trades?: Trade[] }>) => {
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

  return {
    totalPL,
    numTrades: totalTrades,
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

export const getEmotionStyle = (emotion: string | null) => {
  if (!emotion) return {
    bg: "bg-gray-50 dark:bg-gray-800/30",
    border: "border-gray-200 dark:border-gray-700",
    shadow: "shadow-gray-100/50 dark:shadow-gray-900/50",
  };

  switch (emotion.toLowerCase()) {
    case 'positive':
      return {
        bg: "bg-accent/10 dark:bg-accent/20",
        border: "border-accent dark:border-accent",
        shadow: "shadow-accent/20 dark:shadow-accent/20",
      };
    case 'negative':
      return {
        bg: "bg-primary/10 dark:bg-primary/20",
        border: "border-primary dark:border-primary",
        shadow: "shadow-primary/20 dark:shadow-primary/20",
      };
    case 'neutral':
      return {
        bg: "bg-secondary/10 dark:bg-secondary/20",
        border: "border-secondary dark:border-secondary",
        shadow: "shadow-secondary/20 dark:shadow-secondary/20",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-800/30",
        border: "border-gray-200 dark:border-gray-700",
        shadow: "shadow-gray-100/50 dark:shadow-gray-900/50",
      };
  }
};
