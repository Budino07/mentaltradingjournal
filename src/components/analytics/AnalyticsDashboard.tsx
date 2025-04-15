
import { useState } from "react";
import { EquityCurve } from "./EquityCurve";
import { TimeBasedPerformance } from "./TimeBasedPerformance";
import { TradeTimePerformance } from "./TradeTimePerformance";
import { SetupPerformance } from "./SetupPerformance";
import { AssetPairPerformance } from "./AssetPairPerformance";
import { PerformanceBreakdown } from "./PerformanceBreakdown";
import { RuleAdherence } from "./RuleAdherence";
import { TradeDuration } from "./TradeDuration";
import { ProfitLossDistribution } from "./ProfitLossDistribution";
import { TradeFrequency } from "./TradeFrequency";
import { TradeFrequencyByMonth } from "./TradeFrequencyByMonth";
import { TradeFrequencyByWeek } from "./TradeFrequencyByWeek";
import { RiskRewardAnalysis } from "./RiskRewardAnalysis";
import { WinLossRatio } from "./WinLossRatio";
import { PreTradingEvents } from "./PreTradingEvents";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const AnalyticsDashboard = () => {
  const tradingComponents = [
    EquityCurve,
    TimeBasedPerformance,
    TradeTimePerformance,
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Trading Analytics</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Analyze your trading performance and strategies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {tradingComponents.map((Component, index) => (
            <Component key={index} />
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
};
