
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Trophy, TrendingUp } from "lucide-react";

interface WinRateInsightProps {
  data: WrappedMonthData;
}

export const WinRateInsight: React.FC<WinRateInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="bg-primary/10 p-6 rounded-full">
        <Trophy className="h-12 w-12 text-primary animate-pulse" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-4xl font-bold">{data.winRate.toFixed(1)}%</h2>
        <p className="text-2xl text-muted-foreground">Win Rate</p>
      </div>
      
      <div className="mt-4 text-lg">
        <p className="flex items-center justify-center gap-2">
          <TrendingUp className="text-green-500" />
          <span>
            {data.winRate >= 50 
              ? "You're winning more trades than you're losing!" 
              : "Keep refining your strategy to improve your win rate."}
          </span>
        </p>
      </div>
    </div>
  );
};
