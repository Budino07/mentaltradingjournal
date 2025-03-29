
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Flame } from "lucide-react";
import { PerformanceInsight } from "./performance/PerformanceInsight";
import { useIsMobile } from "@/hooks/use-mobile";

export const OverheatMap = () => {
  const isMobile = useIsMobile();
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: generateAnalytics,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Overheat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData || !analyticsData.journalEntries || analyticsData.journalEntries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Overheat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <p>No trading data available yet</p>
            <p className="text-sm">Add trade entries to visualize your trading patterns</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process data to create the overheat map
  const tradeEntries = analyticsData.journalEntries
    .filter(entry => entry.trades && entry.trades.length > 0)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Create a map of dates with frequency
  const tradeDates = new Map();
  let totalTrades = 0;
  
  tradeEntries.forEach(entry => {
    const date = new Date(entry.created_at).toISOString().split('T')[0];
    const tradesCount = entry.trades.length;
    totalTrades += tradesCount;
    
    if (tradeDates.has(date)) {
      tradeDates.set(date, tradeDates.get(date) + tradesCount);
    } else {
      tradeDates.set(date, tradesCount);
    }
  });

  // Find max trades per day for intensity calculation
  const maxTradesPerDay = Math.max(...Array.from(tradeDates.values()));
  
  // Calculate average trades per day
  const avgTradesPerDay = totalTrades / tradeDates.size || 0;
  
  // Format dates into a grid for rendering
  const now = new Date();
  const cells = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = tradeDates.get(dateStr) || 0;
    const intensity = maxTradesPerDay > 0 ? count / maxTradesPerDay : 0;
    
    cells.push({
      date: dateStr,
      count,
      intensity,
    });
  }

  // Generate insights
  const mostActiveDate = Array.from(tradeDates.entries())
    .sort((a, b) => b[1] - a[1])[0];
  
  const highActivity = mostActiveDate 
    ? `${mostActiveDate[1]} trades on ${new Date(mostActiveDate[0]).toLocaleDateString()}`
    : "No high activity days found";
  
  const mainInsight = `Your average is ${avgTradesPerDay.toFixed(1)} trades per day.`;
  const recommendedAction = avgTradesPerDay > 5 
    ? "Consider focusing on quality over quantity to improve results."
    : "Maintain your disciplined trading frequency.";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Overheat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`mb-4 grid grid-cols-7 gap-1 ${isMobile ? 'gap-[2px]' : 'gap-1'}`}>
          {cells.map((cell, i) => (
            <div 
              key={i}
              className={`aspect-square rounded ${isMobile ? 'p-[1px]' : 'p-1'} relative`}
              title={`${cell.date}: ${cell.count} trades`}
            >
              <div
                className={`h-full w-full rounded ${getHeatColor(cell.intensity)}`}
              >
                {!isMobile && cell.count > 0 && (
                  <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-background text-[8px] font-bold">
                    {cell.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-2 flex justify-between text-xs">
          <div>Less active</div>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
              <div key={i} className={`h-3 w-3 rounded ${getHeatColor(level)}`}></div>
            ))}
          </div>
          <div>More active</div>
        </div>
        
        <div className="mt-4">
          <PerformanceInsight
            mainInsight={mainInsight}
            recommendedAction={recommendedAction}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get the appropriate heat color based on intensity
const getHeatColor = (intensity: number): string => {
  if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
  if (intensity < 0.2) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (intensity < 0.4) return "bg-emerald-200 dark:bg-emerald-800/40";
  if (intensity < 0.6) return "bg-yellow-200 dark:bg-yellow-700/50";
  if (intensity < 0.8) return "bg-orange-200 dark:bg-orange-700/60";
  return "bg-red-300 dark:bg-red-700/70";
};
