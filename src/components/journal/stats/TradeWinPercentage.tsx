
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useState } from "react";
import { TimeFilter } from "@/hooks/useJournalFilters";
import { startOfMonth, subMonths, isWithinInterval, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns";

interface TradeWinPercentageProps {
  timeFilter: TimeFilter;
  hasEntries: boolean;
}

export const TradeWinPercentage = ({ timeFilter, hasEntries }: TradeWinPercentageProps) => {
  const [emotionFilter, setEmotionFilter] = useState<string>("all");
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const getTimeInterval = () => {
    const now = new Date();
    switch (timeFilter) {
      case "this-month":
        return {
          start: startOfMonth(now),
          end: now
        };
      case "last-month":
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case "last-three-months":
        return {
          start: startOfMonth(subMonths(now, 3)),
          end: now
        };
      case "last-year":
        return {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1))
        };
      default:
        return null;
    }
  };

  const calculateWinRate = () => {
    if (!analytics?.journalEntries || analytics.journalEntries.length === 0) return 0;

    // Get entries within the time filter
    let timeFilteredEntries = analytics.journalEntries;
    const interval = getTimeInterval();
    if (interval) {
      timeFilteredEntries = timeFilteredEntries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return isWithinInterval(entryDate, interval);
      });
    }

    if (timeFilteredEntries.length === 0) return 0;

    // Get all trades from all entries
    const allTrades = timeFilteredEntries.flatMap(entry => entry.trades || []);
    
    // Filter out trades with undefined or NaN PnL
    const validTrades = allTrades.filter(trade => {
      const pnl = Number(trade.pnl);
      return !isNaN(pnl);
    });

    // If there are no valid trades, return 0
    if (validTrades.length === 0) return 0;

    const winningTrades = validTrades.filter(trade => Number(trade.pnl) > 0);
    return (winningTrades.length / validTrades.length) * 100;
  };

  const winRate = calculateWinRate();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-16 bg-muted rounded"></div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Trade Win %</span>
        <ArrowUpDown className="h-4 w-4 text-primary" />
      </div>
      <div className="text-2xl font-bold text-foreground">
        {hasEntries ? winRate.toFixed(1) : '0.0'}%
      </div>
      <div className="mt-2">
        <Select
          value={emotionFilter}
          onValueChange={setEmotionFilter}
          disabled={!hasEntries}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by emotion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emotions</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
