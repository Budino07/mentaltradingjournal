
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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
      <p className="font-medium text-sm text-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0].fill }}
        />
        <span className="text-muted-foreground">Win Rate:</span>
        <span className="font-medium text-foreground">
          {payload[0].value.toFixed(1)}%
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        ({payload[0].payload.tradeCount} trades)
      </div>
    </div>
  );
};

export const TradeDuration = () => {
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

  // Process trades to calculate durations and win rates
  const allTrades = analytics.journalEntries.flatMap(entry => entry.trades || []);
  
  const calculateDuration = (trade: any) => {
    if (!trade.entryDate || !trade.exitDate) return 0;
    const entryTime = new Date(trade.entryDate).getTime();
    const exitTime = new Date(trade.exitDate).getTime();
    return Math.max(0, (exitTime - entryTime) / (1000 * 60)); // Duration in minutes
  };

  const durationRanges = [
    { min: 0, max: 30, label: "< 30 min" },
    { min: 30, max: 60, label: "30-60 min" },
    { min: 60, max: 180, label: "1-3 hrs" },
    { min: 180, max: 360, label: "3-6 hrs" },
    { min: 360, max: 540, label: "6-9 hrs" },
    { min: 540, max: 720, label: "9-12 hrs" },
    { min: 720, max: 1440, label: "12-24 hrs" },
    { min: 1440, max: Infinity, label: "> 24 hrs" },
  ];

  const data = durationRanges.map(range => {
    const tradesInRange = allTrades.filter(trade => {
      const duration = calculateDuration(trade);
      return duration > range.min && duration <= range.max;
    });

    const totalTrades = tradesInRange.length;
    const winningTrades = tradesInRange.filter(trade => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
      return pnl > 0;
    }).length;

    return {
      duration: range.label,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      tradeCount: totalTrades,
    };
  }).filter(item => item.tradeCount > 0); // Only show ranges with trades

  const bestDuration = data.reduce((prev, current) => 
    current.winRate > prev.winRate && current.tradeCount > 0 ? current : prev
  );

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Trade Duration Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Performance based on how long trades are held
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="duration" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }} 
              domain={[0, 100]}
              label={{ 
                value: 'Win Rate (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Bar 
              dataKey="winRate" 
              fill="#6E59A5" 
              name="Win Rate" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
          <p>Your {bestDuration.duration} trades have a {bestDuration.winRate.toFixed(1)}% win rate.</p>
          <p>Consider focusing more on trades within this duration range for optimal results.</p>
        </div>
      </div>
    </Card>
  );
};
