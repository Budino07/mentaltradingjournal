
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PerformanceBreakdown } from "./PerformanceBreakdown";
import { RuleAdherence } from "./RuleAdherence";
import { PreTradingEvents } from "./PreTradingEvents";
import { TradeDuration } from "./TradeDuration";
import { ProfitLossDistribution } from "./ProfitLossDistribution";
import { TradeFrequency } from "./TradeFrequency";
import { TradeFrequencyByMonth } from "./TradeFrequencyByMonth";
import { TradeFrequencyByWeek } from "./TradeFrequencyByWeek";
import { RiskRewardAnalysis } from "./RiskRewardAnalysis";
import { WinLossRatio } from "./WinLossRatio";
import { AssetPairPerformance } from "./AssetPairPerformance";
import { TimeBasedPerformance } from "./TimeBasedPerformance";
import { TradeTimePerformance } from "./TradeTimePerformance";
import { EquityCurve } from "./EquityCurve";
import { SetupPerformance } from "./SetupPerformance";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const AnalyticsDashboard = () => {
  const [activeView, setActiveView] = useState<'all' | 'trading'>('all');

  const tradingComponents = [
    EquityCurve,
    TimeBasedPerformance,
    TradeTimePerformance, // Moved to be next to TimeBasedPerformance
    SetupPerformance,
    AssetPairPerformance,
    PerformanceBreakdown,
    RuleAdherence,
    TradeDuration,
    ProfitLossDistribution,
    TradeFrequency,
    TradeFrequencyByWeek,
    TradeFrequencyByMonth,
    RiskRewardAnalysis,
    WinLossRatio,
    PreTradingEvents,
  ];

  const getFilteredComponents = () => {
    // Now we only have trading components
    return tradingComponents;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Trading Analytics</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Analyze your trading performance and emotional patterns
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeView === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveView('all')}
              className="flex-1 sm:flex-none"
            >
              All Analytics
            </Button>
            <Button
              variant={activeView === 'trading' ? 'default' : 'outline'}
              onClick={() => setActiveView('trading')}
              className="flex-1 sm:flex-none"
            >
              Trading Analytics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {getFilteredComponents().map((Component, index) => (
            <Component key={index} />
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
};
