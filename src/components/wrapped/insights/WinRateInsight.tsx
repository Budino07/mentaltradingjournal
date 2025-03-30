
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Trophy, TrendingUp } from "lucide-react";

interface WinRateInsightProps {
  data: WrappedMonthData;
}

export const WinRateInsight: React.FC<WinRateInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      {/* Trophy icon with glowing effect */}
      <div className="bg-primary/20 p-6 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/30 rounded-full animate-pulse-slow"></div>
        <Trophy className="h-12 w-12 text-primary relative z-10" />
      </div>
      
      {/* Win rate percentage */}
      <div className="space-y-2 relative">
        <div className="absolute -inset-4 blur-xl -z-10">
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"></div>
        </div>
        <h2 className="text-4xl font-bold">{data.winRate.toFixed(1)}%</h2>
        <p className="text-2xl text-muted-foreground">Win Rate</p>
      </div>
      
      {/* Strategy tip */}
      <div className="mt-4 text-lg p-4 backdrop-blur-sm rounded-lg bg-primary/5 border border-primary/10">
        <p className="flex items-center justify-center gap-2">
          <TrendingUp className={data.winRate >= 50 ? "text-green-500" : "text-primary"} />
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
