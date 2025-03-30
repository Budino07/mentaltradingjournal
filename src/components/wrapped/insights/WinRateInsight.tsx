
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Trophy, TrendingUp } from "lucide-react";

interface WinRateInsightProps {
  data: WrappedMonthData;
}

export const WinRateInsight: React.FC<WinRateInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in backdrop-blur-sm">
      <div className="bg-primary/10 p-6 rounded-full relative overflow-hidden glass-effect">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/20 rounded-full animate-pulse-slow"></div>
        <Trophy className="h-12 w-12 text-primary relative z-10" />
      </div>
      
      <div className="space-y-4 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-md -z-10"></div>
        <h2 className="text-4xl font-bold">{data.winRate.toFixed(1)}%</h2>
        <p className="text-2xl text-muted-foreground">Win Rate</p>
      </div>
      
      <div className="mt-4 text-lg max-w-xs backdrop-blur-sm rounded-lg p-4 glass-effect">
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
