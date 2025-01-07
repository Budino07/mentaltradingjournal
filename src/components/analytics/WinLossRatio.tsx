import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
        <p className="font-medium text-sm text-foreground mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="text-muted-foreground">Percentage:</span>
          <span className="font-medium text-foreground">
            {payload[0].value.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const WinLossRatio = () => {
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

  // Process trades to calculate win/loss ratio
  const allTrades = analytics.journalEntries.flatMap(entry => entry.trades || []);
  const winningTrades = allTrades.filter(trade => Number(trade.pnl) > 0).length;
  const totalTrades = allTrades.length;
  
  const winRate = totalTrades ? (winningTrades / totalTrades) * 100 : 0;
  const lossRate = totalTrades ? ((totalTrades - winningTrades) / totalTrades) * 100 : 0;

  const data = [
    { name: "Winning Trades", value: winRate },
    { name: "Losing Trades", value: lossRate },
  ];

  const COLORS = ['#6E59A5', '#FEC6A1'];

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Win/Loss Ratio</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of winning vs losing trades
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {winRate >= 50
            ? `Your current win rate is ${winRate.toFixed(1)}%, which is above the recommended minimum of 50% for consistent profitability.`
            : `Your current win rate is ${winRate.toFixed(1)}%. Consider reviewing your trading strategy to improve win rate above 50%.`}
        </p>
      </div>
    </Card>
  );
};
