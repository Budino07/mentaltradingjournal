
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Flame, ArrowDown } from "lucide-react";

interface StreakInsightProps {
  data: WrappedMonthData;
}

export const StreakInsight: React.FC<StreakInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-green-500/10 p-6 rounded-full">
          <Flame className="h-12 w-12 text-green-500 animate-pulse" />
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold">{data.longestWinStreak}</div>
          <p className="text-xl text-muted-foreground">Consecutive Winning Trades</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="bg-red-500/10 p-6 rounded-full">
          <ArrowDown className="h-12 w-12 text-red-500 animate-pulse" />
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold">{data.longestLoseStreak}</div>
          <p className="text-xl text-muted-foreground">Consecutive Losing Trades</p>
        </div>
      </div>
    </div>
  );
};
