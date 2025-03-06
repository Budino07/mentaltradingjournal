
import { Card } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { EquityCurveChart } from "./equity-curve/EquityCurveChart";
import { EquityMetrics } from "./equity-curve/EquityMetrics";
import { supabase } from "@/integrations/supabase/client";
import { getInitialCapital, setInitialCapital } from "@/utils/capitalUtils";
import { CapitalSettingsDialog } from "./CapitalSettingsDialog";

export const EquityCurve = () => {
  const [selectedBalance, setSelectedBalance] = useState(() => getInitialCapital());
  
  const { data: analytics, isLoading, refetch } = useQuery({
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
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Update initial capital when changed externally
  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedBalance(getInitialCapital());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCapitalUpdate = () => {
    // Refresh initial capital from localStorage
    setSelectedBalance(getInitialCapital());
  };

  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4 col-span-2">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[400px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Process journal entries to calculate equity curve data
  let runningBalance = selectedBalance;
  
  const equityData = analytics.journalEntries
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc: any[], entry) => {
      // Ensure trades array exists and has elements
      const trades = entry.trades || [];
      const dailyPnL = trades.reduce((sum, trade) => {
        const pnlValue = trade.pnl || trade.profit_loss || 0;
        return sum + (typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue);
      }, 0);

      runningBalance += dailyPnL;
      
      acc.push({
        date: new Date(entry.created_at).toLocaleDateString(),
        balance: runningBalance,
        dailyPnL,
      });
      
      return acc;
    }, []);

  // Calculate performance metrics
  const currentBalance = equityData.length > 0 ? equityData[equityData.length - 1]?.balance : selectedBalance;
  const totalReturn = ((currentBalance - selectedBalance) / selectedBalance) * 100;
  
  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = selectedBalance;
  
  equityData.forEach(point => {
    if (point.balance > peak) {
      peak = point.balance;
    }
    const drawdown = ((peak - point.balance) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return (
    <Card className="p-4 md:p-6 space-y-4 col-span-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-bold">Equity Curve</h3>
          <CapitalSettingsDialog onSave={handleCapitalUpdate} />
        </div>
        <p className="text-sm text-muted-foreground">
          Track your account balance progression over time
        </p>
      </div>

      <EquityCurveChart
        data={equityData}
        initialBalance={selectedBalance}
      />

      <EquityMetrics
        initialBalance={selectedBalance}
        currentBalance={currentBalance}
        totalReturn={totalReturn}
        maxDrawdown={maxDrawdown}
      />
    </Card>
  );
};
