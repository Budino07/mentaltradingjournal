import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { startOfMonth, endOfMonth, format, isWithinInterval, getWeeksInMonth, addWeeks, isSameMonth } from "date-fns";
import { calculateDayStats } from "./calendar/calendarUtils";
import { Trade } from "@/types/trade";
import { ArrowUpRight, ArrowDownRight, DollarSign, LineChart, TrendingUp, BarChart } from "lucide-react";
import { JournalEntryType } from "@/types/journal";

interface WeeklyPerformanceProps {
  entries: JournalEntryType[];
  currentMonth: Date;
}

interface WeekSummary {
  weekNumber: number;
  totalPL: number;
  tradeCount: number;
  startDate: Date;
  endDate: Date;
}

export const WeeklyPerformance = ({ entries, currentMonth }: WeeklyPerformanceProps) => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeekSummary[]>([]);
  
  useEffect(() => {
    calculateWeeklySummaries();
  }, [entries, currentMonth]);
  
  const calculateWeeklySummaries = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const numberOfWeeks = getWeeksInMonth(currentMonth);
    
    const summaries: WeekSummary[] = [];
    
    for (let i = 0; i < numberOfWeeks; i++) {
      const weekStart = i === 0 ? monthStart : addWeeks(monthStart, i);
      const weekStartDate = weekStart;
      const weekEndDate = i === numberOfWeeks - 1 
        ? monthEnd 
        : new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
      
      // Skip weeks that don't belong to this month
      if (!isSameMonth(weekStartDate, currentMonth)) {
        continue;
      }
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return isWithinInterval(entryDate, {
          start: weekStartDate,
          end: weekEndDate
        }) && isSameMonth(entryDate, currentMonth);
      });
      
      let totalPL = 0;
      let totalTrades = 0;
      const processedTradeIds = new Set<string>();
      
      weekEntries.forEach(entry => {
        if (entry.trades && entry.trades.length > 0) {
          entry.trades.forEach(trade => {
            // Only count each trade once using its ID
            if (trade.id && !processedTradeIds.has(trade.id)) {
              processedTradeIds.add(trade.id);
              totalTrades++;
              
              const pnlValue = trade.pnl || trade.profit_loss || 0;
              const numericPnL = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
              totalPL += isNaN(numericPnL) ? 0 : numericPnL;
            }
          });
        }
      });
      
      summaries.push({
        weekNumber: i + 1,
        totalPL,
        tradeCount: totalTrades,
        startDate: weekStartDate,
        endDate: weekEndDate
      });
    }
    
    setWeeklySummaries(summaries);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const getWeekLabel = (startDate: Date, endDate: Date) => {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
        Weekly Performance
      </h3>
      
      {weeklySummaries.length > 0 ? (
        weeklySummaries.map((week, index) => (
          <Card 
            key={index}
            className={`p-4 hover:shadow-lg transition-all duration-300 border ${
              week.totalPL > 0 
                ? 'border-green-500/20 bg-green-50/10 dark:bg-green-900/10' 
                : week.totalPL < 0 
                  ? 'border-red-500/20 bg-red-50/10 dark:bg-red-900/10' 
                  : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Week {week.weekNumber}
              </span>
              <span className="text-xs text-muted-foreground">
                {getWeekLabel(week.startDate, week.endDate)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">P&L</span>
                </div>
                <div className={`text-xl font-bold ${
                  week.totalPL > 0 ? 'text-green-500' : week.totalPL < 0 ? 'text-red-500' : ''
                }`}>
                  {formatCurrency(week.totalPL)}
                </div>
                {week.totalPL !== 0 && (
                  <div className="flex items-center text-xs">
                    {week.totalPL > 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500">Profit</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-500">Loss</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-4 w-4 text-accent-dark" />
                  <span className="text-sm font-medium">Trades</span>
                </div>
                <div className="text-xl font-bold">
                  {week.tradeCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  {week.tradeCount > 0 ? 'trades executed' : 'no trades'}
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-4 border-dashed border-2 bg-muted/50">
          <div className="text-center py-6">
            <LineChart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No trading data available for this month
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
