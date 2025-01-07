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

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length >= 2) {
    const emotionalScore = payload[0]?.value;
    const pnlValue = payload[1]?.value;

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
        <p className="font-medium text-sm text-foreground mb-2">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {item.name}:
            </span>
            <span className="font-medium text-foreground">
              {item.name === "Emotional Score" 
                ? `${typeof item.value === 'number' ? item.value : 'N/A'}`
                : `$${typeof item.value === 'number' ? item.value.toFixed(2) : 'N/A'}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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

  const data = analytics.emotionTrend;

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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis 
              yAxisId="emotion"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Emotional Score', 
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="emotion"
              type="monotone"
              dataKey="emotionalScore"
              stroke="#6E59A5"
              strokeWidth={2}
              dot={{ fill: "#6E59A5" }}
              name="Emotional Score"
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