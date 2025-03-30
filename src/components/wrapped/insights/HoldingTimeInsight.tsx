
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
    <div className="w-full flex flex-col items-center justify-between h-full py-2">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-indigo-500/10 p-5 rounded-full relative overflow-hidden glass-effect">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-indigo-500/20 rounded-full animate-pulse-slow"></div>
          <Timer className="h-10 w-10 text-indigo-500 relative z-10" />
        </div>
        
        <div className="space-y-2 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 rounded-full blur-md -z-10"></div>
          <h2 className="text-3xl font-bold">{formatHoldingTime(data.avgHoldingTime)}</h2>
          <p className="text-xl text-muted-foreground">Average Holding Time</p>
        </div>
      </div>
      
      <div className="backdrop-blur-sm rounded-lg p-3 glass-effect max-w-xs">
        <p className="text-lg">
          Based on your holding time, you trade like a
          <span className="text-xl font-bold text-primary block mt-1">{holdingTimeCategory()}</span>
        </p>
      </div>
      
      <div className="w-full max-w-xs">
        <div className="h-3 w-full bg-gray-200/30 rounded-full relative overflow-hidden glass-effect">
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
