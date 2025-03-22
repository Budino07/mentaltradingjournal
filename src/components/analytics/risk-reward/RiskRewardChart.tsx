
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  date: Date;
  riskRewardRatio: number;
  isSignificant: boolean;
  pnl: number;
}

interface RiskRewardChartProps {
  data: DataPoint[];
}

export const RiskRewardChart = ({ data }: RiskRewardChartProps) => {
  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            name="Date"
            tickFormatter={(date) => {
              if (!(date instanceof Date)) return '';
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            dataKey="riskRewardRatio" 
            type="number"
            name="R:R Ratio"
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax + 1']}
            label={{ 
              value: 'Risk:Reward Ratio', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: '12px' }
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)}`, 'R:R Ratio']}
            labelFormatter={(label: Date) => {
              if (!(label instanceof Date)) return '';
              return label.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }}
          />
          <ReferenceLine y={1} stroke="#8884d8" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="#82ca9d" strokeDasharray="3 3" />
          <Scatter 
            name="R:R Ratio" 
            data={data} 
            fill={(entry) => {
              const dataPoint = entry as unknown as DataPoint;
              return dataPoint.pnl > 0 ? "#4ade80" : "#f87171";
            }}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
