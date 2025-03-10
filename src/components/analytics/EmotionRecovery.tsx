
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { CustomTooltip } from "./shared/CustomTooltip";

export const EmotionRecovery = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Transform emotionRecovery data into the format needed for the chart
  const totalRecoveries = Object.values(analytics.emotionRecovery).reduce((a, b) => a + b, 0);
  
  // Check if we have any recovery data
  const hasRecoveryData = totalRecoveries > 0;

  const data = Object.entries(analytics.emotionRecovery).map(([days, frequency]) => ({
    days,
    frequency: hasRecoveryData ? Math.round((frequency / totalRecoveries) * 100) : 0 // Round to whole number
  })).sort((a, b) => {
    // Custom sort to maintain the correct order
    const order = {
      '< 1 day': 1,
      '1-2 days': 2,
      '2-3 days': 3,
      '> 3 days': 4
    };
    return order[a.days as keyof typeof order] - order[b.days as keyof typeof order];
  });

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Emotion Recovery Time</h3>
        <p className="text-sm text-muted-foreground">
          Time taken to recover emotionally after losing trades
        </p>
      </div>

      {hasRecoveryData ? (
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="days" 
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                tickLine={{ stroke: 'currentColor' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                tickLine={{ stroke: 'currentColor' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'currentColor', opacity: 0.1 }}
              />
              <Bar 
                dataKey="frequency" 
                fill="#6E59A5" 
                name="Frequency"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px] bg-accent/5 rounded-lg">
          <p className="text-muted-foreground text-center">
            Not enough data to display recovery patterns.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Log both losses and subsequent recoveries to see this chart.
          </p>
        </div>
      )}

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
          {hasRecoveryData ? (
            <>
              <p>
                {data[0].frequency > 40 
                  ? "You show strong emotional resilience, typically recovering within a day after losses."
                  : "Consider developing strategies to improve emotional recovery time after losses."}
              </p>
              <p>
                {data[0].days === '< 1 day' 
                  ? "Quick recovery times indicate good emotional management."
                  : "Longer recovery times might be impacting your trading performance."}
              </p>
            </>
          ) : (
            <p>To see insights about your emotional recovery patterns, log trades with losses and then track your emotions afterward until you record a positive emotion or winning trade.</p>
          )}
        </div>
      </div>
    </Card>
  );
};
