
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { startOfMonth, startOfQuarter, startOfYear, isAfter } from "date-fns";
import { getInitialCapital } from "@/utils/capitalUtils";
import { CapitalSettingsDialog } from "./CapitalSettingsDialog";
import { PerformanceInsight } from "./performance/PerformanceInsight";

export const TimeBasedPerformance = () => {
  const [initialCapital, setInitialCapital] = useState(() => getInitialCapital());
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  // Update initial capital when changed externally
  useEffect(() => {
    const handleStorageChange = () => {
      setInitialCapital(getInitialCapital());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  const calculateMetrics = (startDate: Date) => {
    const relevantEntries = analytics.journalEntries.filter(entry => 
      isAfter(new Date(entry.created_at), startDate) && entry.trades && entry.trades.length > 0
    );

    const allTrades = relevantEntries.flatMap(entry => entry.trades || []);
    const totalTrades = allTrades.length;
    const winningTrades = allTrades.filter(trade => Number(trade.pnl) > 0).length;
    const strikeRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const totalPnL = allTrades.reduce((sum, trade) => sum + (Number(trade.pnl) || 0), 0);
    const percentagePerformance = (totalPnL / initialCapital) * 100;

    return {
      strikeRate,
      percentagePerformance,
      totalTrades,
    };
  };

  const now = new Date();
  const monthMetrics = calculateMetrics(startOfMonth(now));
  const quarterMetrics = calculateMetrics(startOfQuarter(now));
  const yearMetrics = calculateMetrics(startOfYear(now));

  const timeframes = [
    { label: "Past Month", ...monthMetrics },
    { label: "Past Quarter", ...quarterMetrics },
    { label: "Past Year", ...yearMetrics },
  ];

  const handleCapitalUpdate = () => {
    // Refresh initial capital from localStorage
    setInitialCapital(getInitialCapital());
  };

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Time-Based Performance</h3>
          <p className="text-sm text-muted-foreground">
            Analysis of trading performance across different time horizons
          </p>
        </div>
        <CapitalSettingsDialog onSave={handleCapitalUpdate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeframes.map((timeframe) => (
          <div
            key={timeframe.label}
            className="p-4 rounded-lg border border-border/50 space-y-3"
          >
            <h4 className="font-semibold text-sm">{timeframe.label}</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Strike Rate</p>
                <p className="text-lg font-bold">
                  {timeframe.strikeRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  ({timeframe.totalTrades} trades)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className={`text-lg font-bold ${
                  timeframe.percentagePerformance >= 0 
                    ? 'text-emerald-500' 
                    : 'text-red-500'
                }`}>
                  {timeframe.percentagePerformance >= 0 ? '+' : ''}
                  {timeframe.percentagePerformance.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PerformanceInsight
        mainInsight="Your strategy is delivering strong returns despite a 50% strike rate."
        recommendedAction="Consider analyzing whether this approach is sustainable and how to maximize your edge further through our MFE/MAE Analysis tool"
      />
    </Card>
  );
};
