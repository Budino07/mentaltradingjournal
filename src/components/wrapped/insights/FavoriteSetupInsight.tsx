
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Target } from "lucide-react";

interface FavoriteSetupInsightProps {
  data: WrappedMonthData;
}

export const FavoriteSetupInsight: React.FC<FavoriteSetupInsightProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-4">
      <div className="bg-amber-500/10 p-5 rounded-full relative overflow-hidden glass-effect">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-amber-500/20 rounded-full animate-pulse-slow"></div>
        <Target className="h-10 w-10 text-amber-500 relative z-10" />
      </div>
      
      <div className="space-y-2 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-full blur-md -z-10"></div>
        <h2 className="text-3xl font-bold capitalize">{data.favoriteSetup || "No Setup Data"}</h2>
        <p className="text-xl text-muted-foreground">Your Favorite Trading Setup</p>
      </div>
      
      <div className="max-w-xs backdrop-blur-sm rounded-lg p-3 glass-effect">
        <p className="text-base">
          {data.favoriteSetup === 'None' 
            ? "Try adding 'Setup' information to your trades to see insights here."
            : "This is the pattern you traded most frequently this month. Is it also your most profitable one?"}
        </p>
      </div>
      
      <div className="w-32 h-32 relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 opacity-20 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 opacity-30 animate-pulse" style={{ animationDelay: "200ms" }} />
        <div className="absolute inset-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 opacity-40 animate-pulse" style={{ animationDelay: "400ms" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Target className="h-6 w-6 text-amber-500" />
        </div>
      </div>
    </div>
  );
};
