
import { JournalEntry } from "@/types/analytics";

export const calculateMistakeFrequencies = (entries: JournalEntry[]) => {
  return entries.reduce((acc, entry) => {
    // Only process entries that have mistakes
    if (entry.mistakes && entry.mistakes.length > 0) {
      // Calculate total loss from trades in this entry
      const totalLoss = (entry.trades || [])
        .filter(trade => {
          const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                     typeof trade.pnl === 'number' ? trade.pnl : 0;
          return pnl < 0;  // Only consider negative PnL (losses)
        })
        .reduce((sum, trade) => {
          const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                     typeof trade.pnl === 'number' ? trade.pnl : 0;
          return sum + Math.abs(pnl);  // Convert to positive value for display
        }, 0);

      // Distribute loss to each mistake
      entry.mistakes.forEach(mistake => {
        if (!acc[mistake]) acc[mistake] = { count: 0, loss: 0 };
        acc[mistake].count++;
        acc[mistake].loss += totalLoss / entry.mistakes.length; // Distribute loss evenly among mistakes
      });
    }
    return acc;
  }, {} as Record<string, { count: number; loss: number }>);
};
