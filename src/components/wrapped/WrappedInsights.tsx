
import React, { useState } from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { InsightCard } from "./insights/InsightCard";
import { WinRateInsight } from "./insights/WinRateInsight";
import { StreakInsight } from "./insights/StreakInsight";
import { ActiveTimeInsight } from "./insights/ActiveTimeInsight";
import { FavoriteSetupInsight } from "./insights/FavoriteSetupInsight";
import { HoldingTimeInsight } from "./insights/HoldingTimeInsight";
import { EmotionPerformanceInsight } from "./insights/EmotionPerformanceInsight";
import { OvertradingInsight } from "./insights/OvertradingInsight";
import { EmotionalHeatmapInsight } from "./insights/EmotionalHeatmapInsight";

interface WrappedInsightsProps {
  data: WrappedMonthData;
}

export const WrappedInsights: React.FC<WrappedInsightsProps> = ({ data }) => {
  const [currentInsight, setCurrentInsight] = useState(0);

  const insights = [
    {
      id: 'win-rate',
      title: 'Win Rate',
      component: <WinRateInsight data={data} />
    },
    {
      id: 'streaks',
      title: 'Trading Streaks',
      component: <StreakInsight data={data} />
    },
    {
      id: 'active-time',
      title: 'Most Active Trading Time',
      component: <ActiveTimeInsight data={data} />
    },
    {
      id: 'favorite-setup',
      title: 'Favorite Setup',
      component: <FavoriteSetupInsight data={data} />
    },
    {
      id: 'holding-time',
      title: 'Average Holding Time',
      component: <HoldingTimeInsight data={data} />
    },
    {
      id: 'emotion-performance',
      title: 'Mood vs. Performance',
      component: <EmotionPerformanceInsight data={data} />
    },
    {
      id: 'overtrading',
      title: 'Overtrading Indicator',
      component: <OvertradingInsight data={data} />
    },
    {
      id: 'emotional-heatmap',
      title: 'Emotional Heatmap',
      component: <EmotionalHeatmapInsight data={data} />
    }
  ];

  const handleNext = () => {
    setCurrentInsight((prev) => (prev + 1) % insights.length);
  };

  const handlePrevious = () => {
    setCurrentInsight((prev) => (prev - 1 + insights.length) % insights.length);
  };

  return (
    <div className="w-full">
      <InsightCard 
        insight={insights[currentInsight]} 
        totalInsights={insights.length}
        currentIndex={currentInsight}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};
