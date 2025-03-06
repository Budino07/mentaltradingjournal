
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CustomTooltip } from "./shared/CustomTooltip";

export const TradeFrequencyByMonth = () => {
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

  // Initialize monthly counts and P&L for all months
  const monthData = {
    'January': { trades: 0, pnl: 0 },
    'February': { trades: 0, pnl: 0 },
    'March': { trades: 0, pnl: 0 },
    'April': { trades: 0, pnl: 0 },
    'May': { trades: 0, pnl: 0 },
    'June': { trades: 0, pnl: 0 },
    'July': { trades: 0, pnl: 0 },
    'August': { trades: 0, pnl: 0 },
    'September': { trades: 0, pnl: 0 },
    'October': { trades: 0, pnl: 0 },
    'November': { trades: 0, pnl: 0 },
    'December': { trades: 0, pnl: 0 }
  };

  // Process all trades from journal entries
  const processedTradeIds = new Set<string>();
  
  analytics.journalEntries.forEach(entry => {
    if (!entry.trades) return;
    
    entry.trades.forEach(trade => {
      // Skip if we've already counted this trade
      if (!trade.id || processedTradeIds.has(trade.id)) return;
      
      // Use trade entry date if available, otherwise use journal entry date
      const tradeDate = trade.entryDate 
        ? parseISO(trade.entryDate)
        : parseISO(entry.created_at);
      
      const month = format(tradeDate, 'MMMM'); // Get full month name
      
      // Convert trade pnl to number
      const pnlValue = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                      typeof trade.pnl === 'number' ? trade.pnl : 0;
      
      // Update month data
      monthData[month].trades++;
      monthData[month].pnl += pnlValue;
      
      // Mark this trade as processed
      processedTradeIds.add(trade.id);
    });
  });

  // Convert month data to chart data format, ensuring the months are in order
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const data = months.map(month => ({
    month,
    trades: monthData[month].trades,
    pnl: monthData[month].pnl,
  }));

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const totalTrades = Object.values(monthData).reduce((sum, data) => sum + data.trades, 0);
  const totalPnl = Object.values(monthData).reduce((sum, data) => sum + data.pnl, 0);
  
  const busyMonth = months.reduce((max, month) => 
    monthData[month].trades > monthData[max].trades ? month : max, 
    months[0]
  );
  
  const valueFormatter = (value: number, dataKey?: string) => {
    if (dataKey === 'pnl') {
      return `$${value.toFixed(2)}`;
    }
    return `${value} trades`;
  };

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Trade Frequency By Month</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of trades across different months
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatYAxisTick}
              label={{ 
                value: 'Number of Trades', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip 
              content={
                <CustomTooltip 
                  valueFormatter={(value, dataKey) => valueFormatter(value, dataKey)}
                  customProps={{ showPnl: true }}
                />
              }
            />
            <Area 
              type="monotone" 
              dataKey="trades" 
              name="Trades"
              fill="#6E59A5" 
              stroke="#6E59A5" 
              fillOpacity={0.2}
            />
            <Area 
              type="monotone" 
              dataKey="pnl" 
              name="Net P&L"
              fill="transparent" 
              stroke="transparent" 
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">Monthly Analysis</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {totalTrades > 0 
            ? `Your highest trading activity occurs in ${busyMonth} with ${monthData[busyMonth].trades} trades. Net P&L for the year: $${totalPnl.toFixed(2)}.`
            : "Start logging trades to see your monthly trading patterns."}
        </p>
      </div>
    </Card>
  );
};
