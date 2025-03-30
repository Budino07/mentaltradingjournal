
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Timer } from "lucide-react";

interface HoldingTimeInsightProps {
  data: WrappedMonthData;
}

export const HoldingTimeInsight: React.FC<HoldingTimeInsightProps> = ({ data }) => {
  // Format holding time nicely (convert minutes to hours and minutes if needed)
  const formatHoldingTime = (minutes: number) => {
    if (minutes < 1) {
      return "Less than a minute";
    }
    
    if (minutes < 60) {
      return `${Math.round(minutes)} minute${minutes === 1 ? '' : 's'}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    
    return `${hours} hour${hours === 1 ? '' : 's'} and ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
  };

  const holdingTimeCategory = () => {
    if (data.avgHoldingTime < 10) return "Scalper";
    if (data.avgHoldingTime < 60) return "Day Trader";
    if (data.avgHoldingTime < 240) return "Intraday Trader";
    return "Swing Trader";
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="bg-indigo-500/10 p-6 rounded-full">
        <Timer className="h-12 w-12 text-indigo-500 animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-bold">{formatHoldingTime(data.avgHoldingTime)}</h2>
        <p className="text-2xl text-muted-foreground">Average Holding Time</p>
      </div>
      
      <div className="mt-4 max-w-xs">
        <p className="text-lg">
          Based on your holding time, you trade like a
        </p>
        <p className="text-2xl font-bold text-primary mt-2">{holdingTimeCategory()}</p>
      </div>
      
      <div className="w-full max-w-sm mt-4">
        <div className="h-3 w-full bg-gray-200 rounded-full relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full absolute"
            style={{ 
              width: `${Math.min(100, (data.avgHoldingTime / 240) * 100)}%`,
              transition: 'width 1s ease-in-out'
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Scalper</span>
          <span>Day Trader</span>
          <span>Swing Trader</span>
        </div>
      </div>
    </div>
  );
};
