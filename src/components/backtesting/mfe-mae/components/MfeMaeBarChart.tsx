
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ChartData } from "../types";

interface MfeMaeBarChartProps {
  data: ChartData[];
}

export function MfeMaeBarChart({ data }: MfeMaeBarChartProps) {
  const dataWithNumbers = [...data].reverse().map((item, index) => ({
    ...item,
    tradeNum: (index + 1).toString(),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dataWithNumbers}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        stackOffset="sign"
      >
        <CartesianGrid 
          horizontal={true} 
          vertical={false} 
          stroke="hsl(var(--border))"
          strokeDasharray="3 3"
        />
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
        <ReferenceLine y={100} stroke="#FEC6A1" strokeWidth={2} />
        <ReferenceLine y={-100} stroke="#9b87f5" strokeWidth={2} />
        <XAxis 
          dataKey="tradeNum" 
          label={{ 
            value: 'Trade', 
            position: 'bottom',
            style: { fill: 'hsl(var(--foreground))' }
          }}
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <YAxis 
          domain={[-100, 100]} 
          label={{ 
            value: 'Updraw / Drawdown', 
            angle: -90, 
            position: 'insideLeft',
            offset: 0,
            dy: 60,
            style: { fill: 'hsl(var(--foreground))' }
          }}
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip 
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;

            const data = payload[0].payload;
            const updrawValue = data.mfeRelativeToTp;
            const drawdownValue = data.maeRelativeToSl;
            const capturedMove = data.capturedMove;

            return (
              <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <div className="space-y-2">
                  <p className="text-lg font-bold text-foreground">Trade #{data.tradeNum}</p>
                  <p className="text-lg text-foreground">{data.instrument || 'Unknown'}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FEC6A1]" />
                    <span className="text-foreground">Updraw: {updrawValue?.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#9b87f5]" />
                    <span className="text-foreground">Drawdown: {Math.abs(drawdownValue)?.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0EA5E9]" />
                    <span className="text-foreground">Captured Move: {capturedMove?.toFixed(2)}%</span>
                  </div>
                  <p className="text-foreground">R-Multiple: {data.rMultiple?.toFixed(2) || '0'}</p>
                </div>
              </div>
            );
          }}
        />
        <Legend 
          verticalAlign="top" 
          align="right"
          wrapperStyle={{ 
            paddingBottom: "20px",
            color: 'hsl(var(--foreground))'
          }}
        />
        <Bar 
          dataKey="mfeRelativeToTp" 
          fill="#FEC6A1" 
          name="Updraw" 
          stackId="stack"
        >
          {dataWithNumbers.map((entry, index) => (
            <circle
              key={`dot-${index}`}
              cx={`${index * (100 / (dataWithNumbers.length - 1))}%`}
              cy={`${50 - (entry.capturedMove || 0) / 2}%`}
              r={4}
              fill="#0EA5E9"
            />
          ))}
        </Bar>
        <Bar 
          dataKey="maeRelativeToSl" 
          fill="#9b87f5" 
          name="Drawdown" 
          stackId="stack"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
