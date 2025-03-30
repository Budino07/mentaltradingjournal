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
  Line,
} from "recharts";
import { ChartData } from "../types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface MfeMaeBarChartProps {
  data: ChartData[];
}

export function MfeMaeBarChart({ data }: MfeMaeBarChartProps) {
  const navigate = useNavigate();
  
  // Sort data chronologically by entry date
  const sortedData = [...data].sort((a, b) => {
    const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0;
    const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0;
    return dateA - dateB;
  });

  const dataWithNumbers = sortedData.map((item, index) => ({
    ...item,
    tradeNum: (index + 1).toString(),
  }));

  const handleDataPointClick = (data: any) => {
    if (data.journalEntryId) {
      navigate('/dashboard', { 
        state: { 
          selectedDate: data.entryDate ? new Date(data.entryDate) : new Date()
        }
      });
    }
  };

  // Custom shape for captured move indicator
  const CapturedMoveIndicator = ({ x, y, width, capturedMove, index }: any) => {
    if (capturedMove === undefined) return null;
    
    // Calculate the position for the line
    const lineYPosition = capturedMove > 0 
      ? y + ((100 - capturedMove) / 100) * width 
      : y + width; // If negative or zero, place at bottom
    
    // Determine line color based on captured move value
    const lineColor = capturedMove > 0 
      ? "#4ade80" // Aesthetic green for positive values
      : "#f87171"; // Aesthetic red for negative values
    
    return (
      <line
        x1={x}
        y1={lineYPosition}
        x2={x + width}
        y2={lineYPosition}
        stroke={lineColor}
        strokeWidth={2}
        strokeDasharray={capturedMove < 0 ? "4 2" : "none"} // Dashed if negative
      />
    );
  };

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
        onClick={(data) => {
          if (data && data.activePayload && data.activePayload.length > 0) {
            handleDataPointClick(data.activePayload[0].payload);
          }
        }}
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
            style: { fill: 'hsl(var(--card-foreground))' }
          }}
          tick={{ fill: 'hsl(var(--card-foreground))' }}
        />
        <YAxis 
          domain={[-100, 100]} 
          label={{ 
            value: 'Updraw / Drawdown', 
            angle: -90, 
            position: 'insideLeft',
            offset: 0,
            dy: 60,
            style: { fill: 'hsl(var(--card-foreground))' }
          }}
          tick={{ fill: 'hsl(var(--card-foreground))' }}
        />
        <Tooltip 
          cursor={{ fill: 'transparent', cursor: 'pointer' }}
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;

            const data = payload[0].payload;
            const formattedDate = data.entryDate ? format(new Date(data.entryDate), 'MMM d, yyyy') : '';

            return (
              <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                <div className="space-y-2">
                  <p className="text-lg font-bold text-card-foreground">Trade #{data.tradeNum}</p>
                  {formattedDate && <p className="text-sm text-card-foreground">{formattedDate}</p>}
                  <p className="text-lg text-card-foreground">{data.instrument || 'Unknown'}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FEC6A1]" />
                    <span className="text-card-foreground">Updraw: {data.mfeRelativeToTp?.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#9b87f5]" />
                    <span className="text-card-foreground">Drawdown: {Math.abs(data.maeRelativeToSl)?.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      backgroundColor: data.capturedMove > 0 ? "#4ade80" : "#f87171" 
                    }} />
                    <span className="text-card-foreground">Captured Move: {data.capturedMove?.toFixed(2)}%</span>
                  </div>
                  <p className="text-card-foreground">R-Multiple: {data.rMultiple?.toFixed(2) || '0'}</p>
                  <p className="text-xs text-muted-foreground italic mt-2">Click to view journal entry</p>
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
            color: 'hsl(var(--card-foreground))'
          }}
        />
        <Bar 
          dataKey="mfeRelativeToTp" 
          fill="#FEC6A1" 
          name="Updraw" 
          stackId="stack"
          cursor="pointer"
          shape={(props) => {
            const { x, y, width, height, capturedMove, index } = props;
            return (
              <>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="#FEC6A1"
                  rx={4}
                  ry={4}
                />
                <CapturedMoveIndicator 
                  x={x} 
                  y={y} 
                  width={width} 
                  capturedMove={props.payload.capturedMove} 
                  index={index} 
                />
              </>
            );
          }}
        />
        <Bar 
          dataKey="maeRelativeToSl" 
          fill="#9b87f5" 
          name="Drawdown" 
          stackId="stack"
          cursor="pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
