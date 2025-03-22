
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { CustomTooltip } from "./shared/CustomTooltip";
import { format, parseISO } from "date-fns";

const emotionToNumber = (emotion: string) => {
  switch (emotion.toLowerCase()) {
    case 'positive':
      return 2;
    case 'neutral':
      return 1;
    case 'negative':
      return 0;
    default:
      return 1;
  }
};

const numberToEmotion = (value: number) => {
  switch (value) {
    case 2:
      return 'Positive';
    case 1:
      return 'Neutral';
    case 0:
      return 'Negative';
    default:
      return 'Neutral';
  }
};

export const EmotionalTendencies = () => {
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

  // Create a map to store aggregated data by date
  const dataByDate = new Map();

  // First pass: Aggregate P&L and collect emotions for each date
  analytics.journalEntries.forEach(entry => {
    const date = format(parseISO(entry.created_at), 'MMM dd');
    
    const totalPnL = entry.trades?.reduce((sum, trade) => {
      const pnlValue = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) :
                      typeof trade.pnl === 'number' ? trade.pnl :
                      typeof trade.profit_loss === 'string' ? parseFloat(trade.profit_loss) :
                      typeof trade.profit_loss === 'number' ? trade.profit_loss : 0;
      return sum + (isNaN(pnlValue) ? 0 : pnlValue);
    }, 0) || 0;

    if (!dataByDate.has(date)) {
      dataByDate.set(date, {
        date,
        emotionalScore: emotionToNumber(entry.emotion),
        tradingResult: totalPnL,
        rawDate: entry.created_at // Keep raw date for sorting
      });
    } else {
      const existing = dataByDate.get(date);
      dataByDate.set(date, {
        ...existing,
        tradingResult: existing.tradingResult + totalPnL
      });
    }
  });

  // Convert map to array and sort by date
  const data = Array.from(dataByDate.values())
    .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

  const formatValue = (value: number) => {
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return numberToEmotion(value);
      }
      return `$${value.toFixed(2)}`;
    }
    return value;
  };

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Emotional Impact on Trading</h3>
        <p className="text-sm text-muted-foreground">
          Track how your emotions correlate with trading performance
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="emotion"
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tickFormatter={formatValue}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Emotional State', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <YAxis
              yAxisId="pnl"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'P&L ($)', 
                angle: 90, 
                position: 'insideRight',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip 
              content={<CustomTooltip valueFormatter={formatValue} />}
            />
            <Legend />
            <Line
              yAxisId="emotion"
              type="stepAfter"
              dataKey="emotionalScore"
              stroke="#6E59A5"
              strokeWidth={2}
              dot={{ fill: "#6E59A5" }}
              name="Emotional State"
            />
            <Line
              yAxisId="pnl"
              type="monotone"
              dataKey="tradingResult"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={{ fill: "#0EA5E9" }}
              name="P&L"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {analytics.mainInsight} {analytics.recommendedAction}
        </p>
      </div>
    </Card>
  );
};
