import { JournalEntry } from "@/types/analytics";

export const calculateMistakeFrequencies = (entries: JournalEntry[]) => {
  return entries.reduce((acc, entry) => {
    if (entry.mistakes) {
      entry.mistakes.forEach(mistake => {
        if (!acc[mistake]) acc[mistake] = { count: 0, loss: 0 };
        acc[mistake].count++;
        // Sum up losses for trades in entries with this mistake
        const totalLoss = (entry.trades || [])
          .reduce((sum, trade) => sum + (Number(trade.pnl) < 0 ? Math.abs(Number(trade.pnl)) : 0), 0);
        acc[mistake].loss += totalLoss;
      });
    }
    return acc;
  }, {} as Record<string, { count: number; loss: number }>);
};