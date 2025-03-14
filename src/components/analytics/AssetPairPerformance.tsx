
import { Card } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { AssetPairChart } from "./asset-pair/AssetPairChart";

export const AssetPairPerformance = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[350px] md:h-[400px] bg-accent/10 rounded"></div>
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

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Asset Pair Performance</h3>
        <p className="text-sm text-muted-foreground">
          Profit and loss distribution across different instruments
        </p>
      </div>

      <AssetPairChart data={data} />

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {data.length > 0 
            ? `${data[0].pair} shows the highest profitability with a net gain of $${data[0].net.toLocaleString()}, while ${
                data[data.length - 1].pair
              } shows the lowest performance with ${
                data[data.length - 1].net >= 0 ? 'a net gain' : 'a net loss'
              } of $${Math.abs(data[data.length - 1].net).toLocaleString()}.`
            : "Start adding trades to see insights about your asset pair performance."}
        </p>
      </div>
    </Card>
  );
};
