
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { AlertTriangle } from "lucide-react";

interface OvertradingInsightProps {
  data: WrappedMonthData;
}

export const OvertradingInsight: React.FC<OvertradingInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="bg-yellow-500/10 p-6 rounded-full">
        <AlertTriangle className="h-12 w-12 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-4xl font-bold">{data.overtradingDays}</h2>
        <p className="text-2xl text-muted-foreground">Days of Overtrading</p>
      </div>
      
      <div className="mt-4 max-w-xs">
        <p className="text-lg">
          {data.overtradingDays === 0 
            ? "Great job! You maintained trading discipline all month."
            : data.overtradingDays === 1 
              ? "You exceeded your usual trade count on 1 day this month."
              : `You exceeded your usual trade count on ${data.overtradingDays} days this month.`}
        </p>
      </div>
      
      <div className="w-full max-w-sm mt-4">
        <div className="relative h-28 bg-gradient-to-b from-yellow-100/20 to-yellow-500/20 rounded-lg overflow-hidden">
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index}
              className={`absolute bottom-0 w-6 rounded-t-md ${
                index < data.overtradingDays ? 'bg-yellow-500' : 'bg-gray-300/30'
              }`}
              style={{ 
                height: `${20 + Math.random() * 60}%`,
                left: `${index * 10 + 5}%`,
                transition: 'height 0.5s ease-out',
                animationDelay: `${index * 100}ms`
              }}
            />
          ))}
          <div className="absolute bottom-2 left-2 text-xs text-yellow-800">Overtrading Score</div>
        </div>
      </div>
    </div>
  );
};
