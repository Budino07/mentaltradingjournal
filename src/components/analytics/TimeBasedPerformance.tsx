
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { startOfMonth, startOfQuarter, startOfYear, isAfter } from "date-fns";
import { BalanceInputForm } from "./time-based/BalanceInputForm";
import { useNavigate } from "react-router-dom";

export const TimeBasedPerformance = () => {
  const navigate = useNavigate();
  const [initialCapital, setInitialCapital] = useState(10000);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved balance from localStorage on component mount
  useEffect(() => {
    const savedBalance = localStorage.getItem("tradingBalance");
    if (savedBalance) {
      setInitialCapital(parseFloat(savedBalance));
    }
  }, []);

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const handleSaveBalance = (balance: number) => {
    setIsLoading(true);
    
    // Save to localStorage
    localStorage.setItem("tradingBalance", balance.toString());
    
    // Simulate API call with a short delay
    setTimeout(() => {
      setInitialCapital(balance);
      setIsLoading(false);
      
      // Refresh the page and navigate back to analytics
      navigate(0);
    }, 500);
  };

  if (isAnalyticsLoading || !analytics) {
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
      totalPnL,
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

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <h3 className="text-xl md:text-2xl font-bold">Time-Based Performance</h3>
          <BalanceInputForm 
            defaultValue={initialCapital}
            onSave={handleSaveBalance}
            isLoading={isLoading}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Analysis of trading performance across different time horizons
        </p>
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
                <p className="text-xs text-muted-foreground">
                  ({timeframe.totalPnL >= 0 ? '+' : ''}${Math.abs(timeframe.totalPnL).toFixed(2)})
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {monthMetrics.strikeRate > quarterMetrics.strikeRate && monthMetrics.strikeRate > yearMetrics.strikeRate
            ? "Your recent performance shows improvement in strike rate compared to longer timeframes."
            : "Consider reviewing your trading strategy as recent performance indicates room for improvement."}
        </p>
      </div>
    </Card>
  );
};
