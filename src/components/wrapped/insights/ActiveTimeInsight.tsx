
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Clock } from "lucide-react";

interface ActiveTimeInsightProps {
  data: WrappedMonthData;
}

export const ActiveTimeInsight: React.FC<ActiveTimeInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="bg-blue-500/10 p-6 rounded-full backdrop-blur-lg">
        <Clock className="h-12 w-12 text-blue-500 animate-pulse" />
      </div>
      
      <div className="space-y-3 backdrop-blur-md bg-black/10 p-4 rounded-xl">
        <h2 className="text-5xl font-bold">{data.mostActiveTime}</h2>
        <p className="text-2xl text-muted-foreground">Your Peak Trading Hour</p>
      </div>
      
      <div className="mt-4 max-w-xs backdrop-blur-md bg-black/10 p-3 rounded-lg">
        <p className="text-lg">
          This is when you're most active in the markets. Are these your most profitable hours too?
        </p>
      </div>
      
      <div className="w-full max-w-sm mt-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 h-24 rounded-lg relative overflow-hidden backdrop-blur-lg">
        <div className="absolute inset-0 flex items-center">
          <div 
            className="h-full w-2 bg-blue-500 absolute animate-pulse"
            style={{ 
              left: `calc(${parseInt(data.mostActiveTime) / 24 * 100}%)`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
          <div className="w-full h-px bg-blue-500/50" />
        </div>
        <div className="absolute bottom-2 left-2 text-xs">Market Open</div>
        <div className="absolute bottom-2 right-2 text-xs">Market Close</div>
      </div>
    </div>
  );
};
