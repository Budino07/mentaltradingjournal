import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CustomTooltip } from "./shared/CustomTooltip";

export const TradeFrequency = () => {
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

  // Initialize weekday counts
  const weekdayCounts: Record<string, number> = {
    'Sunday': 0,
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0
  };

  // Process all trades from journal entries
  const processedTradeIds = new Set<string>();
  
  analytics.journalEntries.forEach(entry => {
    if (!entry.trades) return;
    
    entry.trades.forEach(trade => {
      // Skip if we've already counted this trade
      if (!trade.id || processedTradeIds.has(trade.id)) return;
      
      // Use trade entry date if available, otherwise use journal entry date
      const tradeDate = trade.entryDate 
        ? parseISO(trade.entryDate)
        : parseISO(entry.created_at);
      
      const weekday = format(tradeDate, 'EEEE'); // Get full weekday name
      weekdayCounts[weekday]++;
      
      // Mark this trade as processed
      processedTradeIds.add(trade.id);
    });
  });

  // Convert weekday counts to chart data format
  const data = Object.entries(weekdayCounts).map(([day, trades]) => ({
    date: day,
    trades: trades,
  }));

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const totalTrades = data.reduce((sum, day) => sum + day.trades, 0);
  const averageTrades = totalTrades / 7;
  const peakTradingDay = data.reduce((max, day) => day.trades > max.trades ? day : max);

  const valueFormatter = (value: number) => `${value} trades`;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Trade Frequency</h3>
        <p className="text-sm text-muted-foreground">
          Number of trades by day of the week
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatYAxisTick}
              label={{ 
                value: 'Number of Trades', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip 
              content={<CustomTooltip valueFormatter={valueFormatter} />}
            />
            <Area 
              type="monotone" 
              dataKey="trades" 
              name="Trades"
              fill="#6E59A5" 
              stroke="#6E59A5" 
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          Your trading frequency averages {averageTrades.toFixed(1)} trades per day, with peak activity of {peakTradingDay.trades} trades on {peakTradingDay.date}.
        </p>
      </div>
    </Card>
  );
};
