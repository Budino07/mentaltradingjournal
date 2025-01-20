import { Card } from "@/components/ui/card";
import { DollarSign, Percent, Smile, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { TradeWinPercentage } from "./TradeWinPercentage";
import { Button } from "@/components/ui/button";
import { useTimeFilter } from "@/contexts/TimeFilterContext";
import { startOfMonth, subMonths, startOfQuarter, isWithinInterval, endOfMonth } from "date-fns";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const StatsHeader = () => {
  const queryClient = useQueryClient();
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('journal_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { stats } = useProgressTracking();
  const { timeFilter, setTimeFilter } = useTimeFilter();

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
      default:
        return null;
    }
  };

  const filterEntriesByTime = (entries: any[]) => {
    const interval = getTimeInterval();
    if (!interval) return entries;

    return entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return isWithinInterval(entryDate, interval);
    });
  };

  const filteredEntries = analytics ? filterEntriesByTime(analytics.journalEntries) : [];

  // Calculate net P&L from filtered trades with proper numeric conversion and unique trade tracking
  const processedTradeIds = new Set<string>();
  const netPnL = filteredEntries.reduce((total, entry) => {
    const tradePnL = entry.trades?.reduce((sum: number, trade: any) => {
      // Only process each trade once using its ID
      if (trade && trade.id && !processedTradeIds.has(trade.id)) {
        processedTradeIds.add(trade.id);
        const pnlValue = trade.pnl || trade.profit_loss || 0;
        const numericPnL = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
        return sum + (isNaN(numericPnL) ? 0 : numericPnL);
      }
      return sum;
    }, 0) || 0;
    return total + tradePnL;
  }, 0);

  // Calculate profit factor from filtered trades with unique trade tracking
  const profitFactor = filteredEntries.reduce((acc, entry) => {
    const trades = entry.trades || [];
    trades.forEach(trade => {
      // Only process each trade once
      if (trade && trade.id && !processedTradeIds.has(trade.id)) {
        processedTradeIds.add(trade.id);
        const pnl = Number(trade.pnl) || 0;
        if (pnl > 0) acc.profits += pnl;
        if (pnl < 0) acc.losses += Math.abs(pnl);
      }
    });
    return acc;
  }, { profits: 0, losses: 0 });

  const profitFactorValue = profitFactor.losses === 0 ? 
    profitFactor.profits > 0 ? "∞" : "0" : 
    (profitFactor.profits / profitFactor.losses).toFixed(2);

  // Calculate emotion meter from filtered entries
  const emotionStats = filteredEntries.reduce((acc, entry) => {
    if (entry.emotion?.toLowerCase().includes('positive')) acc.positive++;
    acc.total++;
    return acc;
  }, { positive: 0, total: 0 });

  const emotionScore = emotionStats.total === 0 ? 0 : 
    (emotionStats.positive / emotionStats.total) * 100;

  if (isAnalyticsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-start gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-start gap-2">
        <Button 
          variant={timeFilter === "this-month" ? "default" : "outline"}
          onClick={() => setTimeFilter("this-month")}
        >
          This Month
        </Button>
        <Button 
          variant={timeFilter === "last-month" ? "default" : "outline"}
          onClick={() => setTimeFilter("last-month")}
        >
          Last Month
        </Button>
        <Button 
          variant={timeFilter === "last-three-months" ? "default" : "outline"}
          onClick={() => setTimeFilter("last-three-months")}
        >
          Last Quarter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Net P&L</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${Math.abs(netPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm ${netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {netPnL >= 0 ? '▲' : '▼'} {netPnL >= 0 ? 'Profit' : 'Loss'}
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Profit Factor</span>
            <Percent className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {profitFactorValue}
          </div>
          <div className="text-sm text-muted-foreground">
            Profit/Loss Ratio
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Emotion Meter</span>
            <Smile className="h-4 w-4 text-accent-dark" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {emotionScore.toFixed(0)}%
          </div>
          <div className="text-sm text-muted-foreground">
            Positive Emotions
          </div>
        </Card>

        <TradeWinPercentage timeFilter={timeFilter} />

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Daily Streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.dailyStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            Days Active
          </div>
        </Card>
      </div>
    </div>
  );
};