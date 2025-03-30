
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { AlertTriangle } from "lucide-react";

interface OvertradingInsightProps {
  data: WrappedMonthData;
}

export const OvertradingInsight: React.FC<OvertradingInsightProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-4">
      <div className="bg-yellow-500/10 p-5 rounded-full">
        <AlertTriangle className="h-10 w-10 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-4xl font-bold">{data.overtradingDays}</h2>
        <p className="text-xl text-muted-foreground">Days of Overtrading</p>
      </div>
      
      <div className="max-w-xs">
        <p className="text-base">
          {data.overtradingDays === 0 
            ? "Great job! You maintained trading discipline all month."
            : data.overtradingDays === 1 
              ? "You exceeded your usual trade count on 1 day this month."
              : `You exceeded your usual trade count on ${data.overtradingDays} days this month.`}
        </p>
      </div>
      
      <div className="w-full max-w-sm">
        <div className="relative h-24 bg-gradient-to-b from-yellow-100/20 to-yellow-500/20 rounded-lg overflow-hidden">
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
