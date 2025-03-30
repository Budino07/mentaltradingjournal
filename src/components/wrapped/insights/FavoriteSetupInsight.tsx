
import React from "react";
import { WrappedMonthData } from "@/hooks/useWrappedData";
import { Target } from "lucide-react";

interface FavoriteSetupInsightProps {
  data: WrappedMonthData;
}

export const FavoriteSetupInsight: React.FC<FavoriteSetupInsightProps> = ({ data }) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="bg-amber-500/10 p-6 rounded-full backdrop-blur-lg">
        <Target className="h-12 w-12 text-amber-500 animate-pulse" />
      </div>
      
      <div className="space-y-3 backdrop-blur-md bg-black/10 p-4 rounded-xl">
        <h2 className="text-4xl font-bold capitalize">{data.favoriteSetup || "No Setup Data"}</h2>
        <p className="text-2xl text-muted-foreground">Your Favorite Trading Setup</p>
      </div>
      
      <div className="mt-4 max-w-xs backdrop-blur-md bg-black/10 p-3 rounded-lg">
        <p className="text-lg">
          {data.favoriteSetup === 'None' 
            ? "Try adding 'Setup' information to your trades to see insights here."
            : "This is the pattern you traded most frequently this month. Is it also your most profitable one?"}
        </p>
      </div>
      
      <div className="mt-4 w-full max-w-sm flex justify-center">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 opacity-20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 opacity-30 animate-pulse" style={{ animationDelay: "200ms" }} />
          <div className="absolute inset-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 opacity-40 animate-pulse" style={{ animationDelay: "400ms" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
