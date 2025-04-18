
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Clock } from "lucide-react";

interface ActiveTimeInsightProps {
  data: WrappedMonthData;
}

export const ActiveTimeInsight: React.FC<ActiveTimeInsightProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-4">
      <div className="bg-blue-500/10 p-5 rounded-full relative overflow-hidden glass-effect">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/20 rounded-full animate-pulse-slow"></div>
        <Clock className="h-10 w-10 text-blue-500 relative z-10" />
      </div>
      
      <div className="space-y-2 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-full blur-md -z-10"></div>
        <h2 className="text-5xl font-bold">{data.mostActiveTime}</h2>
        <p className="text-xl text-muted-foreground">Your Peak Trading Hour</p>
      </div>
      
      <div className="mt-2 max-w-xs backdrop-blur-sm rounded-lg p-3 glass-effect">
        <p className="text-base">
          This is when you're most active in the markets. Are these your most profitable hours too?
        </p>
      </div>
      
      <div className="w-full max-w-sm bg-gradient-to-r from-indigo-500/20 to-purple-500/20 h-20 rounded-lg relative overflow-hidden glass-effect">
        <div className="absolute inset-0 flex items-center">
          <div 
            className="h-full w-2 bg-blue-500 absolute animate-pulse"
            style={{ 
              left: `calc(${parseInt(data.mostActiveTime) / 24 * 100}%)`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
          <div className="w-full h-px bg-blue-500/30" />
        </div>
        <div className="absolute bottom-2 left-2 text-xs">Market Open</div>
        <div className="absolute bottom-2 right-2 text-xs">Market Close</div>
      </div>
    </div>
  );
};
