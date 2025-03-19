
import { JournalEntry, EmotionStats } from "@/types/analytics";
import { normalizeTradePnL } from "./tradeProcessing";

export const calculateMistakeFrequencies = (journalEntries: JournalEntry[]): Record<string, EmotionStats> => {
  // Initialize an empty record to track mistake frequencies
  const mistakeFrequencies: Record<string, EmotionStats> = {};

  // Process each journal entry
  journalEntries.forEach(entry => {
    // Skip entries without mistakes
    if (!entry.mistakes || entry.mistakes.length === 0) return;

    // Calculate total loss for this entry's trades
    const totalLoss = (entry.trades || [])
      .map(normalizeTradePnL)
      .filter(trade => {
        const pnl = typeof trade.pnl === 'number' ? trade.pnl : 
                   typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 0;
        return pnl < 0;
      })
      .reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'number' ? trade.pnl : 
                   typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 0;
        return sum + Math.abs(pnl);
      }, 0);
    
    // If entry has losses and mistakes, distribute the loss among the mistakes
    if (totalLoss > 0 && entry.mistakes.length > 0) {
      const lossPerMistake = totalLoss / entry.mistakes.length;
      
      // Update each mistake's frequency and associated loss
      entry.mistakes.forEach(mistake => {
        if (!mistakeFrequencies[mistake]) {
          mistakeFrequencies[mistake] = { count: 0, loss: 0 };
        }
        
        mistakeFrequencies[mistake].count += 1;
        mistakeFrequencies[mistake].loss += lossPerMistake;
      });
    } else {
      // Even if there's no loss, still count the mistakes
      entry.mistakes.forEach(mistake => {
        if (!mistakeFrequencies[mistake]) {
          mistakeFrequencies[mistake] = { count: 0, loss: 0 };
        }
        
        mistakeFrequencies[mistake].count += 1;
      });
    }
  });

  console.log("Calculated mistake frequencies:", mistakeFrequencies);
  
  return mistakeFrequencies;
};
