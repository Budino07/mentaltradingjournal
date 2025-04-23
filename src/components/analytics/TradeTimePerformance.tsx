
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Settings } from "lucide-react";
import { format } from "date-fns";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/analyticsUtils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useNavigate } from "react-router-dom";

type TimeOfDayTrade = {
  hour: number;
  minute: number;
  time: string;
  pnl: number;
  instrument?: string;
  direction?: string;
  entryId?: string; // Journal entry ID
  entryDate?: string; // Add entry date for navigation
};

export const TradeTimePerformance = () => {
  const navigate = useNavigate();
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  const tradesByTime = useMemo(() => {
    if (!analyticsData?.journalEntries) return [];

    // Extract all trades from journal entries
    const allTrades: TimeOfDayTrade[] = [];
    
    analyticsData.journalEntries.forEach(entry => {
      if (!entry.trades || entry.trades.length === 0) return;
      
      entry.trades.forEach((trade: Trade) => {
        // Skip trades without entry date or PnL
        if (!trade.entryDate || (!trade.pnl && trade.pnl !== 0)) return;
        
        const entryDate = new Date(trade.entryDate);
        const hour = entryDate.getHours();
        const minute = entryDate.getMinutes();
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
        
        allTrades.push({
          hour,
          minute,
          time: `${hour}:${minute.toString().padStart(2, '0')}`,
          pnl,
          instrument: trade.instrument,
          direction: trade.direction,
          entryId: entry.id, // Add the journal entry ID
          entryDate: entry.created_at // Add the entry created date for navigation
        });
      });
    });
    
    return allTrades;
  }, [analyticsData]);

  // Handle click on a data point
  const handlePointClick = (data: TimeOfDayTrade) => {
    if (data.entryDate) {
      // Navigate to the journal page with the date of the entry
      // This will show entries for that specific date
      const entryDate = new Date(data.entryDate);
      navigate('/dashboard', { 
        state: { 
          selectedDate: entryDate
        }
      });
    }
  };

  // Calculate performance insights
  const performanceInsights = useMemo(() => {
    if (tradesByTime.length === 0) return null;
    
    // Group trades by hour
    const tradesByHour = tradesByTime.reduce((acc, trade) => {
      const hour = trade.hour;
      if (!acc[hour]) {
        acc[hour] = { trades: [], totalPnl: 0, avgPnl: 0, winRate: 0 };
      }
      acc[hour].trades.push(trade);
      acc[hour].totalPnl += trade.pnl;
      return acc;
    }, {} as Record<number, { trades: TimeOfDayTrade[], totalPnl: number, avgPnl: number, winRate: number }>);
    
    // Calculate statistics for each hour
    Object.keys(tradesByHour).forEach(hourKey => {
      const hour = parseInt(hourKey);
      const hourData = tradesByHour[hour];
      const totalTrades = hourData.trades.length;
      const winningTrades = hourData.trades.filter(t => t.pnl > 0).length;
      
      hourData.avgPnl = hourData.totalPnl / totalTrades;
      hourData.winRate = (winningTrades / totalTrades) * 100;
    });
    
    // Find best and worst hours
    let bestHour = -1;
    let worstHour = -1;
    let bestPnl = -Infinity;
    let worstPnl = Infinity;
    
    Object.keys(tradesByHour).forEach(hourKey => {
      const hour = parseInt(hourKey);
      const hourData = tradesByHour[hour];
      
      // Only consider hours with at least 2 trades for significance
      if (hourData.trades.length >= 2) {
        if (hourData.totalPnl > bestPnl) {
          bestPnl = hourData.totalPnl;
          bestHour = hour;
        }
        
        if (hourData.totalPnl < worstPnl) {
          worstPnl = hourData.totalPnl;
          worstHour = hour;
        }
      }
    });
    
    return {
      bestHour: bestHour >= 0 ? {
        hour: bestHour,
        formattedHour: `${bestHour}:00 - ${bestHour + 1}:00`,
        pnl: bestPnl,
        winRate: tradesByHour[bestHour]?.winRate || 0,
        tradeCount: tradesByHour[bestHour]?.trades.length || 0
      } : null,
      worstHour: worstHour >= 0 ? {
        hour: worstHour,
        formattedHour: `${worstHour}:00 - ${worstHour + 1}:00`,
        pnl: worstPnl,
        winRate: tradesByHour[worstHour]?.winRate || 0,
        tradeCount: tradesByHour[worstHour]?.trades.length || 0
      } : null
    };
  }, [tradesByTime]);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Trade Time Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  // If there's no data, show empty state
  if (!tradesByTime.length) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">Trade Time Performance</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center text-center px-4">
          <p className="text-muted-foreground">
            No trade data available. Add trades with entry times to see performance patterns based on time of day.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Trade Time Performance</CardTitle>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground cursor-pointer" />
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="hour" 
                domain={[5, 16]} 
                type="number"
                tickCount={12}
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Hour of Day', 
                  position: 'insideBottom', 
                  offset: -25,
                  fontSize: 12
                }}
              />
              <YAxis 
                dataKey="pnl" 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'P&L', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -40,
                  fontSize: 12
                }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TimeOfDayTrade;
                    return (
                      <div className="bg-card border border-border p-2 rounded-md shadow-md">
                        <p className="font-semibold">{`${data.hour}:${data.minute.toString().padStart(2, '0')}`}</p>
                        <p>{`P&L: ${formatCurrency(data.pnl)}`}</p>
                        {data.instrument && <p>{`Instrument: ${data.instrument}`}</p>}
                        {data.direction && <p>{`Direction: ${data.direction}`}</p>}
                        <p className="text-xs text-primary mt-1">Click to view journal entries for this date</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                name="Profitable Trades" 
                data={tradesByTime.filter(trade => trade.pnl > 0)} 
                fill="#4ade80" 
                cursor="pointer"
                onClick={(data) => handlePointClick(data)}
              />
              <Scatter 
                name="Breakeven Trades" 
                data={tradesByTime.filter(trade => trade.pnl === 0)} 
                fill="#9ca3af" 
                cursor="pointer"
                onClick={(data) => handlePointClick(data)}
              />
              <Scatter 
                name="Losing Trades" 
                data={tradesByTime.filter(trade => trade.pnl < 0)} 
                fill="#f87171" 
                cursor="pointer"
                onClick={(data) => handlePointClick(data)}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {performanceInsights && (
          <div className="mt-4 border-t pt-4 text-sm space-y-2">
            {performanceInsights.bestHour && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best time to trade:</span>
                <span className="font-medium flex items-center">
                  {performanceInsights.bestHour.formattedHour}
                  <span className="ml-2 text-green-500">{formatCurrency(performanceInsights.bestHour.pnl)}</span>
                </span>
              </div>
            )}
            {performanceInsights.worstHour && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Worst time to trade:</span>
                <span className="font-medium flex items-center">
                  {performanceInsights.worstHour.formattedHour}
                  <span className="ml-2 text-red-500">{formatCurrency(performanceInsights.worstHour.pnl)}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
