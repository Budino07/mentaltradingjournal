
import { Card } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { AssetPairChart } from "./asset-pair/AssetPairChart";
import { useIsMobile } from "@/hooks/use-mobile";

export const AssetPairPerformance = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  const isMobile = useIsMobile();
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[400px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Transform assetPairStats into the format needed for the chart
  const data = Object.entries(analytics.assetPairStats).map(([pair, stats]) => ({
    pair,
    profit: stats.profit,
    loss: -Math.abs(stats.loss), // Make loss negative for the chart, but don't stack
    net: stats.profit - stats.loss,
  }));

  // Sort by net P&L to show most profitable pairs first
  data.sort((a, b) => b.net - a.net);

  // Limit data points on mobile
  const displayData = isMobile ? data.slice(0, 5) : data;

  return (
    <Card className="p-3 md:p-6 space-y-3 md:space-y-4">
      <div className="space-y-1 md:space-y-2">
        <h3 className="text-lg md:text-2xl font-bold">Asset Pair Performance</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Profit and loss distribution across different instruments
        </p>
      </div>

      <div className="h-[200px] md:h-[350px]">
        <AssetPairChart data={displayData} />
      </div>

      <div className="space-y-1 md:space-y-2 bg-accent/10 p-2 md:p-4 rounded-lg">
        <h4 className="font-semibold text-xs md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {displayData.length > 0 
            ? `${displayData[0].pair} shows the highest profitability with a net gain of $${displayData[0].net.toLocaleString()}, while ${
                displayData[displayData.length - 1].pair
              } shows the lowest performance with ${
                displayData[displayData.length - 1].net >= 0 ? 'a net gain' : 'a net loss'
              } of $${Math.abs(displayData[displayData.length - 1].net).toLocaleString()}.`
            : "Start adding trades to see insights about your asset pair performance."}
        </p>
      </div>
    </Card>
  );
};
