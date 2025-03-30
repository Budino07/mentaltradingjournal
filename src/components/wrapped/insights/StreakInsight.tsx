
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Flame, ArrowDown } from "lucide-react";

interface StreakInsightProps {
  data: WrappedMonthData;
}

export const StreakInsight: React.FC<StreakInsightProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-green-500/10 p-5 rounded-full relative overflow-hidden glass-effect">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/20 rounded-full animate-pulse-slow"></div>
          <Flame className="h-10 w-10 text-green-500 relative z-10" />
        </div>
        
        <div className="text-center relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-full blur-md -z-10"></div>
          <div className="text-4xl font-bold">{data.longestWinStreak}</div>
          <p className="text-lg text-muted-foreground">Consecutive Winning Trades</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="bg-red-500/10 p-5 rounded-full relative overflow-hidden glass-effect">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-500/20 rounded-full animate-pulse-slow"></div>
          <ArrowDown className="h-10 w-10 text-red-500 relative z-10" />
        </div>
        
        <div className="text-center relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-full blur-md -z-10"></div>
          <div className="text-4xl font-bold">{data.longestLoseStreak}</div>
          <p className="text-lg text-muted-foreground">Consecutive Losing Trades</p>
        </div>
      </div>
    </div>
  );
};
