
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const TradingStruggleInsight = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  if (isLoading) {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Areas to Improve</span>
          <Info className="h-4 w-4 text-muted" />
        </div>
        <div className="animate-pulse h-14 bg-muted rounded" />
      </Card>
    );
  }

  // Find the most frequent mistake
  const topMistake = analytics?.mistakeFrequencies 
    ? Object.entries(analytics.mistakeFrequencies)
        .sort((a, b) => b[1].count - a[1].count)
        .shift()
    : null;

  // Find the asset pair with the lowest win rate
  const worstAssetPair = analytics?.assetPairStats
    ? Object.entries(analytics.assetPairStats)
        .filter(([_, stats]) => stats.trades >= 3) // Only consider pairs with enough data
        .sort((a, b) => a[1].winRate - b[1].winRate)
        .shift()
    : null;

  // Determine if there's a losing streak recently
  const recentTrades = analytics?.journalEntries
    ?.flatMap(entry => entry.trades || [])
    ?.sort((a, b) => {
      const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0;
      const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0;
      return dateB - dateA; // Sort by date descending (newest first)
    })
    ?.slice(0, 5) || [];

  const hasRecentLosses = recentTrades.length >= 3 && 
    recentTrades.filter(trade => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
      return pnl < 0;
    }).length >= 3;

  // Determine the most relevant struggle to show
  let struggleTitle = "Areas to Improve";
  let struggleDetail = "Keep tracking trades to reveal patterns";

  if (topMistake && topMistake[1].count >= 2) {
    struggleTitle = "Common Mistake";
    struggleDetail = topMistake[0];
  } else if (worstAssetPair && worstAssetPair[1].winRate < 0.4) {
    struggleTitle = "Challenging Asset";
    struggleDetail = worstAssetPair[0];
  } else if (hasRecentLosses) {
    struggleTitle = "Recent Setback";
    struggleDetail = "Multiple losses in recent trades";
  }

  return (
    <TooltipProvider>
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{struggleTitle}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Info className="h-4 w-4 text-muted cursor-help" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Focus on this area to improve your trading performance</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base md:text-lg font-medium text-foreground line-clamp-2">
              {struggleDetail}
            </div>
            <div className="text-xs text-muted-foreground">
              Focus area for improvement
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};
