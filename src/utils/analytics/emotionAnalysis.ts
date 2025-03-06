
import { JournalEntry } from "@/types/analytics";

export const calculateEmotionRecovery = (entries: JournalEntry[]) => {
  return entries.reduce((acc, entry, i, arr) => {
    if (entry.outcome === 'loss') {
      let daysToRecover = 0;
      for (let j = i - 1; j >= 0; j--) {
        if (arr[j].outcome === 'win') break;
        daysToRecover++;
      }
      const recoveryRange = daysToRecover <= 1 ? '< 1 day' :
        daysToRecover <= 2 ? '1-2 days' :
        daysToRecover <= 3 ? '2-3 days' : '> 3 days';
      acc[recoveryRange] = (acc[recoveryRange] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

export const calculateEmotionTrend = (entries: JournalEntry[]) => {
  // Filter pre-session entries to get emotional states using ISO date format
  const preSessionEmotions = entries
    .filter(entry => entry.session_type === 'pre')
    .reduce((acc, entry) => {
      const date = new Date(entry.created_at).toISOString().split('T')[0]; // YYYY-MM-DD format
      acc[date] = entry.emotion;
      return acc;
    }, {} as Record<string, string>);

  // Get all trades with their dates and PnL using ISO date format
  const tradesByDate = entries.reduce((acc, entry) => {
    if (!entry.trades) return acc;
    
    entry.trades.forEach(trade => {
      const date = new Date(trade.entryDate || entry.created_at).toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!acc[date]) acc[date] = [];
      
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) :
                 typeof trade.pnl === 'number' ? trade.pnl :
                 typeof trade.profit_loss === 'string' ? parseFloat(trade.profit_loss) :
                 typeof trade.profit_loss === 'number' ? trade.profit_loss : 0;
      
      acc[date].push(pnl);
    });
    return acc;
  }, {} as Record<string, number[]>);

  // Combine emotions with trade performance
  return Object.keys(tradesByDate).map(date => {
    const pnls = tradesByDate[date];
    const totalPnL = pnls.reduce((sum, pnl) => sum + pnl, 0);
    
    return {
      date: new Date(date).getTime(), // Store as timestamp for sorting
      pnl: totalPnL,
      emotion: preSessionEmotions[date] || 'neutral'
    };
  }).sort((a, b) => a.date - b.date); // Sort by date
};
