
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmotionTrend } from "./EmotionTrend";
import { PerformanceBreakdown } from "./PerformanceBreakdown";
import { RuleAdherence } from "./RuleAdherence";
import { EmotionRecovery } from "./EmotionRecovery";
import { PreTradingEvents } from "./PreTradingEvents";
import { TradeDuration } from "./TradeDuration";
import { MistakeAnalysis } from "./MistakeAnalysis";
import { PersonalityPatterns } from "./PersonalityPatterns";
import { ProfitLossDistribution } from "./ProfitLossDistribution";
import { TradeFrequency } from "./TradeFrequency";
import { TradeFrequencyByMonth } from "./TradeFrequencyByMonth";
import { TradeFrequencyByWeek } from "./TradeFrequencyByWeek";
import { RiskRewardAnalysis } from "./RiskRewardAnalysis";
import { WinLossRatio } from "./WinLossRatio";
import { AssetPairPerformance } from "./AssetPairPerformance";
import { TimeBasedPerformance } from "./TimeBasedPerformance";
import { EquityCurve } from "./EquityCurve";
import { EmotionFrequency } from "./EmotionFrequency";
import { SetupPerformance } from "./SetupPerformance";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

export const AnalyticsDashboard = () => {
  const [activeView, setActiveView] = useState<'all' | 'psychological' | 'trading'>('all');
  const isMobile = useIsMobile();

  const psychologicalComponents = [
    EmotionTrend,
    EmotionFrequency,
    MistakeAnalysis,
    EmotionRecovery,
    PreTradingEvents,
    PersonalityPatterns,
  ];

  const tradingComponents = [
    EquityCurve,
    TimeBasedPerformance,
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
  ];

  const getFilteredComponents = () => {
    switch (activeView) {
      case 'psychological':
        return psychologicalComponents;
      case 'trading':
        return tradingComponents;
      default:
        return [EmotionTrend, EmotionFrequency, ...psychologicalComponents.slice(2), ...tradingComponents];
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`${isMobile ? 'p-1' : 'p-4'} space-y-4 md:space-y-6`}>
        <div className="space-y-3 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-xl md:text-3xl font-bold">Trading Analytics</h2>
            <p className="text-xs md:text-base text-muted-foreground">
              Analyze your trading performance and emotional patterns
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeView === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveView('all')}
              className="text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 h-auto"
              size={isMobile ? "sm" : "default"}
            >
              All Analytics
            </Button>
            <Button
              variant={activeView === 'psychological' ? 'default' : 'outline'}
              onClick={() => setActiveView('psychological')}
              className="text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 h-auto"
              size={isMobile ? "sm" : "default"}
            >
              Psychological
            </Button>
            <Button
              variant={activeView === 'trading' ? 'default' : 'outline'}
              onClick={() => setActiveView('trading')}
              className="text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 h-auto"
              size={isMobile ? "sm" : "default"}
            >
              Trading Analytics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {getFilteredComponents().map((Component, index) => (
            <Component key={index} />
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
};
