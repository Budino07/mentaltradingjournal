import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";

type PerformanceData = {
  emotion: string;
  averagePnL: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  domain: [number, number];
  ticks: number[];
}

const formatYAxisTick = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
};

export const PerformanceChart = ({ data, domain, ticks }: PerformanceChartProps) => {
  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ 
            top: 20, 
            right: 30, 
            left: 60, // Increased left margin to accommodate the label
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="emotion" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={domain}
            ticks={ticks}
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxisTick}
            label={{ 
              value: 'Average P&L per Trade', 
              angle: -90, 
              position: 'insideLeft',
              style: { 
                fontSize: '12px',
                textAnchor: 'middle',
                fill: 'currentColor',
                paddingLeft: '20px'
              },
              dx: -45 // Adjust the label position horizontally
            }}
          />
          <Tooltip 
            cursor={false}
            formatter={(value: number) => [formatYAxisTick(value), 'Average P&L']}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))'
            }}
            labelStyle={{ 
              color: 'hsl(var(--foreground))',
              fontWeight: 500,
              marginBottom: '4px'
            }}
            itemStyle={{
              color: 'hsl(var(--foreground))',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="averagePnL" 
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.averagePnL > 500
                    ? "hsl(142.1 76.2% 36.3%)"
                    : entry.averagePnL > 0
                    ? "hsl(142.1 76.2% 46.3%)"
                    : entry.averagePnL > -500
                    ? "hsl(346.8 77.2% 49.8%)"
                    : "hsl(346.8 77.2% 39.8%)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};