
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trade } from "@/types/trade";
import { formatCurrency } from "./calendarUtils";
import { startOfWeek, endOfWeek, format, isSameWeek } from "date-fns";

interface WeeklySummaryProps {
  entries: Array<{
    date: Date;
    emotion: string;
    trades?: Trade[];
  }>;
  currentDate: Date;
}

interface WeekSummary {
  weekStart: Date;
  weekEnd: Date;
  totalPL: number;
  totalTrades: number;
  displayText: string;
}

export const WeeklySummary = ({ entries, currentDate }: WeeklySummaryProps) => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeekSummary[]>([]);

  useEffect(() => {
    calculateWeeklySummaries();
  }, [entries, currentDate]);

  const calculateWeeklySummaries = () => {
    // Create a map to store unique trades by week and ID
    const weeklyTradeMap = new Map<string, Map<string, Trade>>();
    
    // Process all entries and their trades
    entries.forEach(entry => {
      if (!entry.trades || entry.trades.length === 0) return;
      
      const entryDate = new Date(entry.date);
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 0 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeklyTradeMap.has(weekKey)) {
        weeklyTradeMap.set(weekKey, new Map<string, Trade>());
      }
      
      const tradesForWeek = weeklyTradeMap.get(weekKey)!;
      
      entry.trades.forEach(trade => {
        // Skip trades without IDs
        if (!trade.id) return;
        
        // Always use the latest version of each trade
        tradesForWeek.set(trade.id, trade);
      });
    });
    
    // Convert the map to weekly summaries
    const summaries: WeekSummary[] = [];
    
    weeklyTradeMap.forEach((tradesMap, weekKey) => {
      const weekStart = new Date(weekKey);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      
      let totalPL = 0;
      let totalTrades = 0;
      
      tradesMap.forEach(trade => {
        totalTrades++;
        const pnlValue = trade.pnl || trade.profit_loss || 0;
        const numericPnL = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
        totalPL += isNaN(numericPnL) ? 0 : numericPnL;
      });
      
      summaries.push({
        weekStart,
        weekEnd,
        totalPL,
        totalTrades,
        displayText: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
      });
    });
    
    // Sort summaries by date, most recent first
    summaries.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
    
    setWeeklySummaries(summaries);
  };

  const getCurrentWeekSummary = () => {
    return weeklySummaries.find(summary => 
      isSameWeek(currentDate, summary.weekStart, { weekStartsOn: 0 })
    );
  };

  const currentWeekSummary = getCurrentWeekSummary();

  return (
    <div className="space-y-4">
      {currentWeekSummary && (
        <Card className="bg-gradient-to-br from-primary-light/10 to-accent/10 border-primary/20 shadow-lg">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">Current Week Performance</h3>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                {formatCurrency(currentWeekSummary.totalPL)}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentWeekSummary.totalTrades} {currentWeekSummary.totalTrades === 1 ? 'Trade' : 'Trades'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentWeekSummary.displayText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <h3 className="text-lg font-medium px-2">Recent Weeks</h3>
      
      <div className="space-y-3">
        {weeklySummaries.slice(0, 4).map((summary, index) => (
          <Card 
            key={index} 
            className="border-primary/10 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:bg-card/80"
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{summary.displayText}</p>
                <p className={`text-sm font-medium ${summary.totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(summary.totalPL)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.totalTrades} {summary.totalTrades === 1 ? 'Trade' : 'Trades'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
