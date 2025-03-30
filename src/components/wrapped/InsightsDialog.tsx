
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { InsightCard } from "@/components/wrapped/InsightCard";
import { MonthlyInsights } from "@/types/wrapped";

type InsightsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  insights: MonthlyInsights;
  month: string;
};

export const InsightsDialog: React.FC<InsightsDialogProps> = ({
  isOpen,
  onClose,
  insights,
  month,
}) => {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  
  // Create an array of all insights for easy navigation
  const allInsights = [
    { type: "winRate", data: insights.winRate },
    { type: "streak", data: insights.winningStreak },
    { type: "losingStreak", data: insights.losingStreak },
    { type: "activeTime", data: insights.mostActiveTime },
    { type: "favoriteSetup", data: insights.favoriteSetup },
    { type: "holdingTime", data: insights.avgHoldingTime },
    { type: "moodPerformance", data: insights.moodPerformance },
    { type: "overtrading", data: insights.overtrading },
    { type: "emotionalHeatmap", data: insights.emotionalHeatmap },
  ];
  
  const totalInsights = allInsights.length;
  
  const goToNextInsight = () => {
    setCurrentInsightIndex((prev) => (prev + 1) % totalInsights);
  };
  
  const goToPrevInsight = () => {
    setCurrentInsightIndex((prev) => (prev - 1 + totalInsights) % totalInsights);
  };
  
  const currentInsight = allInsights[currentInsightIndex];
  
  // Format month name for display
  const monthDate = new Date(month);
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90%] md:max-w-[700px] max-h-[90vh] p-0 overflow-visible">
        <div className="relative w-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${(currentInsightIndex + 1) / totalInsights * 100}%` }}
            />
          </div>
          
          <div className="pt-6 px-6">
            <h3 className="text-lg font-semibold mb-2">
              {monthName} Wrapped
            </h3>
          </div>
          
          <div className="overflow-hidden">
            <InsightCard 
              insight={currentInsight} 
              onNext={goToNextInsight}
              onPrevious={goToPrevInsight}
              currentIndex={currentInsightIndex}
              totalInsights={totalInsights}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
