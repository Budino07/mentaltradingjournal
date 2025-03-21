
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
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
    <div className="h-[400px] w-full relative">
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
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={true}
            horizontal={true}
            stroke="rgba(255,255,255,0.07)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            interval="preserveStartEnd"
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            label={{
              value: 'Account Balance ($)',
              angle: -90,
              position: 'insideLeft',
              style: {
                fontSize: '12px',
                textAnchor: 'middle',
                fill: 'rgba(255,255,255,0.7)'
              },
              dx: -45
            }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <Tooltip
            content={<CustomTooltip
              valueFormatter={(value) => `$${value.toLocaleString()}`}
            />}
          />
          <ReferenceLine 
            y={initialBalance} 
            stroke="rgba(255,255,255,0.3)" 
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
            label={{
              value: 'Initial Balance',
              position: 'right',
              style: { fill: 'rgba(255,255,255,0.5)' }
            }}
          />
          
          {/* Premium styled line with gradient and glow */}
          <defs>
            <linearGradient id="equity-line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6E59A5" stopOpacity={1} />
              <stop offset="100%" stopColor="#9b87f5" stopOpacity={0.8} />
            </linearGradient>
            <filter id="glow" height="200%" width="200%" x="-50%" y="-50%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <Line
            type="monotone"
            dataKey="balance"
            stroke="url(#equity-line-gradient)"
            strokeWidth={3}
            dot={{
              fill: "#6E59A5",
              stroke: "#9b87f5",
              strokeWidth: 2,
              r: 4
            }}
            activeDot={{
              fill: "#FFFFFF",
              stroke: "#6E59A5",
              strokeWidth: 2,
              r: 6
            }}
            name="Balance"
            filter="url(#glow)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
