
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CustomTooltip } from "../shared/CustomTooltip";

interface EquityCurveChartProps {
  data: Array<{
    date: string;
    balance: number;
    dailyPnL: number;
  }>;
  initialBalance: number;
}

export const EquityCurveChart = ({ data, initialBalance }: EquityCurveChartProps) => {
  // Calculate the dynamic domain for Y-axis
  const calculateYDomain = () => {
    if (data.length === 0) {
      // If no data, set domain around initial balance
      const buffer = initialBalance * 0.025; // 2.5% buffer
      return [initialBalance - buffer, initialBalance + buffer];
    }

    const balances = data.map(d => d.balance);
    const minBalance = Math.min(...balances);
    const maxBalance = Math.max(...balances);
    
    // Calculate buffers
    const buffer = initialBalance * 0.025; // 2.5% of initial balance
    
    // Calculate domain values
    const minDomain = Math.min(minBalance - buffer, initialBalance - buffer);
    const maxDomain = Math.max(maxBalance + buffer, initialBalance + buffer);

    // Ensure minimum 1% visibility for gains
    const minVisibleGain = initialBalance * 0.01;
    if (maxBalance - minBalance < minVisibleGain) {
      return [
        Math.min(initialBalance - buffer, minBalance),
        Math.max(initialBalance + minVisibleGain, maxBalance + buffer)
      ];
    }

    return [minDomain, maxDomain];
  };

  const [yMin, yMax] = calculateYDomain();

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 60,
            bottom: 5
          }}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            label={{
              value: 'Account Balance ($)',
              angle: -90,
              position: 'insideLeft',
              style: {
                fontSize: '12px',
                textAnchor: 'middle',
                fill: 'currentColor'
              },
              dx: -45
            }}
          />
          <Tooltip
            content={<CustomTooltip
              valueFormatter={(value) => `$${value.toLocaleString()}`}
            />}
          />
          <ReferenceLine 
            y={initialBalance} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
            label={{
              value: 'Initial Balance',
              position: 'right',
              style: { fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="hsl(var(--primary))"
            dot={false}
            strokeWidth={2}
            name="Balance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
