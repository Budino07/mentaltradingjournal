import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CustomTooltip } from "../shared/CustomTooltip";

interface RuleAdherenceData {
  name: string;
  wins: number;
  losses: number;
  total: number;
}

interface RuleAdherenceChartProps {
  data: RuleAdherenceData[];
}

export const RuleAdherenceChart = ({ data }: RuleAdherenceChartProps) => {
  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{ 
              value: 'Percentage (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: '12px' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="wins" 
            name="Wins" 
            fill="#6E59A5"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="losses" 
            name="Losses" 
            fill="#FEC6A1"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};