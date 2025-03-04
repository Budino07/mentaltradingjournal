
import { Trade } from "@/types/analytics";

export const analyzeTradeDurations = (trades: Trade[]) => {
  console.log("Analyzing trade durations for trades:", trades);
  
  return trades
    .filter(trade => trade.entryDate && trade.exitDate)
    .map(trade => {
      const entryDate = new Date(trade.entryDate!);
      const exitDate = new Date(trade.exitDate!);
      const duration = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60); // Convert to hours
      
      console.log(`Trade ${trade.instrument}: Duration=${duration} hours, PNL=${trade.pnl}`);
      
      return {
        duration,
        pnl: Number(trade.pnl) || 0,
        instrument: trade.instrument || 'Unknown'
      };
    });
};
