
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
} from "recharts";
import { format, isValid } from "date-fns";

interface RiskRewardData {
  date: Date;
  riskRewardRatio: number;
  isSignificant: boolean;
  pnl: number;
}

interface RiskRewardChartProps {
  data: RiskRewardData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
        <p className="font-medium text-sm text-foreground mb-2">Trade Details</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium text-foreground">
              {isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid Date'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Trade R:R:</span>
            <span className="font-medium text-foreground">
              {data.riskRewardRatio.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">P&L:</span>
            <span className={`font-medium ${data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${data.pnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const RiskRewardChart = ({ data }: RiskRewardChartProps) => {
  const formatDateTick = (dateStr: string) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'MMM d') : '';
  };

  // Ensure all dates are valid Date objects
  const validData = data.map(item => ({
    ...item,
    date: item.date instanceof Date ? item.date : new Date(item.date),
  })).filter(item => isValid(item.date));

  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={validData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={{ fontSize: 12 }}
            label={{
              value: 'Trading Days',
              position: 'bottom',
              style: { fontSize: '12px' }
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: 'R:R',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#666" />
          <Line
            type="monotone"
            dataKey="riskRewardRatio"
            stroke="#6E59A5"
            strokeWidth={2}
            dot={false}
          />
          <Scatter
            data={validData.filter(d => d.isSignificant)}
            dataKey="riskRewardRatio"
            fill="#FF6B6B"
            shape="star"
            r={6}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
