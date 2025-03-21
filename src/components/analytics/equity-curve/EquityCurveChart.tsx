
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Area,
  ComposedChart
} from "recharts";
import { CustomTooltip } from "../shared/CustomTooltip";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/dateUtils";
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface EquityCurveChartProps {
  data: Array<{
    date: string;
    balance: number;
    dailyPnL: number;
  }>;
  initialBalance: number;
}

export const EquityCurveChart = ({ data, initialBalance }: EquityCurveChartProps) => {
  const navigate = useNavigate();

  // Handle dot click to navigate to journal entries for that date
  const handleDotClick = (data: any) => {
    try {
      const dateString = data.payload.date;
      // Convert string date to Date object
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        // Navigate to journal page with date in state
        navigate('/journal', { state: { selectedDate: date } });
      }
    } catch (error) {
      console.error("Error navigating to date:", error);
    }
  };

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

  // Custom dot component with glowing effect and click handler
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Only show dots on some data points for cleaner look
    const shouldShowDot = data.length < 30 || 
      data.indexOf(payload) % Math.max(1, Math.floor(data.length / 15)) === 0;
    
    if (!shouldShowDot) return null;
    
    return (
      <g 
        onClick={() => handleDotClick(props)}
        style={{ cursor: 'pointer' }}
        className="hover:opacity-100"
      >
        {/* Subtle glow effect */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={4} 
          fill="rgba(155, 135, 245, 0.3)" 
          filter="blur(2px)" 
        />
        {/* Visible dot */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={3} 
          stroke="#FFFFFF" 
          strokeWidth={1.5} 
          fill="#9b87f5"
          className="opacity-80 hover:opacity-100" 
        />
        {/* Larger invisible click area */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={10} 
          fill="transparent" 
        />
      </g>
    );
  };

  return (
    <div className="h-[400px] w-full relative">
      {/* Premium chart container with subtle gradient overlay */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-purple-50/5 to-purple-900/10 pointer-events-none" />
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 60,
            bottom: 5
          }}
          className="premium-chart"
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9b87f5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6E59A5" stopOpacity={0.2} />
            </linearGradient>
            
            {/* Gradient for the area under the curve */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9b87f5" stopOpacity={0.3} />
              <stop offset="75%" stopColor="#9b87f5" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#9b87f5" stopOpacity={0} />
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={true} 
            horizontal={true} 
            stroke="hsl(var(--muted-foreground)/0.15)" 
          />
          
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
            stroke="hsl(var(--muted-foreground)/0.6)"
            tickLine={{ stroke: "hsl(var(--muted-foreground)/0.3)" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground)/0.3)" }}
          />
          
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            stroke="hsl(var(--muted-foreground)/0.6)"
            tickLine={{ stroke: "hsl(var(--muted-foreground)/0.3)" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground)/0.3)" }}
            label={{
              value: 'Account Balance ($)',
              angle: -90,
              position: 'insideLeft',
              style: {
                fontSize: '12px',
                textAnchor: 'middle',
                fill: 'hsl(var(--muted-foreground)/0.8)'
              },
              dx: -45
            }}
          />
          
          <Tooltip
            content={<CustomTooltip
              valueFormatter={(value) => `$${value.toLocaleString()}`}
            />}
            wrapperStyle={{ outline: 'none' }}
          />
          
          <ReferenceLine 
            y={initialBalance} 
            stroke="hsl(var(--muted-foreground)/0.5)" 
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
            label={{
              value: 'Initial Balance',
              position: 'right',
              style: { 
                fill: 'hsl(var(--muted-foreground)/0.8)',
                fontSize: '11px',
                fontWeight: '500'
              }
            }}
          />
          
          {/* Area under the curve with gradient */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="none"
            fill="url(#areaGradient)"
            fillOpacity={1}
          />
          
          {/* Main line with gradient and glow effect */}
          <Line
            type="monotone"
            dataKey="balance"
            stroke="url(#equityGradient)"
            strokeWidth={3}
            dot={false}
            activeDot={CustomDot}
            name="Balance"
            connectNulls={true}
            filter="url(#glow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-0 right-0 p-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary">?</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Click on data points to view journal entries for that date</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    </div>
  );
};
