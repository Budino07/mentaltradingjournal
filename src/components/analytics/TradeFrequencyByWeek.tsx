
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, getWeek, getMonth, getYear, startOfWeek, endOfWeek } from "date-fns";
import { CustomTooltip } from "./shared/CustomTooltip";

export const TradeFrequencyByWeek = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  
  const months = useMemo(() => {
    if (!analytics?.journalEntries?.length) return [];
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const uniqueMonths = new Set<string>();
    
    // Add all months with year
    const currentYear = new Date().getFullYear();
    monthNames.forEach(month => {
      uniqueMonths.add(`${month} ${currentYear}`);
    });
    
    return Array.from(uniqueMonths).sort((a, b) => {
      const monthA = monthNames.findIndex(m => a.includes(m));
      const monthB = monthNames.findIndex(m => b.includes(m));
      return monthA - monthB; // Sort chronologically
    });
  }, [analytics]);
  
  const weeklyData = useMemo(() => {
    if (!analytics?.journalEntries?.length) return [];
    
    // Process all trades from journal entries
    const processedTradeIds = new Set<string>();
    
    // Instead of storing weekNum and weekLabel directly in the object,
    // we'll create an interface
    interface WeekCount {
      trades: number;
      pnl: number;
      weekNum: number;
      weekLabel: string;
      year: number;
    }
    
    const weekCounts: Record<string, WeekCount> = {};
    
    analytics.journalEntries.forEach(entry => {
      if (!entry.trades) return;
      
      entry.trades.forEach(trade => {
        // Skip if we've already counted this trade
        if (!trade.id || processedTradeIds.has(trade.id)) return;
        
        // Use trade entry date if available, otherwise use journal entry date
        const tradeDate = trade.entryDate 
          ? parseISO(trade.entryDate)
          : parseISO(entry.created_at);
        
        // Skip if not in selected month
        if (selectedMonth !== "all") {
          const tradeMonth = format(tradeDate, 'MMMM yyyy');
          if (tradeMonth !== selectedMonth) return;
        }
        
        const year = getYear(tradeDate);
        const month = getMonth(tradeDate);
        const weekNum = getWeek(tradeDate, { weekStartsOn: 1 }); // Week starts on Monday
        
        // Generate a week label that's "Week X" 
        const weekLabel = `Week ${weekNum - getWeek(new Date(year, month, 1), { weekStartsOn: 1 }) + 1}`;
        const weekKey = `${year}-${weekNum}`;
        
        // Initialize week if not exists
        if (!weekCounts[weekKey]) {
          weekCounts[weekKey] = { 
            trades: 0, 
            pnl: 0, 
            weekNum,
            weekLabel,
            year
          };
        }
        
        // Update counts
        weekCounts[weekKey].trades++;
        
        // Add PnL if available
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                    typeof trade.pnl === 'number' ? trade.pnl : 0;
        weekCounts[weekKey].pnl += pnl;
        
        // Mark this trade as processed
        processedTradeIds.add(trade.id);
      });
    });

    // Convert to array and sort by year and week
    return Object.values(weekCounts)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.weekNum - b.weekNum;
      })
      .map(week => ({
        week: week.weekLabel,
        trades: week.trades,
        pnl: week.pnl
      }));
  }, [analytics, selectedMonth]);
  
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

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const valueFormatter = (value: number) => `${value} trades`;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Weekly Trade Frequency</h3>
          <p className="text-sm text-muted-foreground">
            Number of trades by week {selectedMonth !== "all" ? `in ${selectedMonth}` : ''}
          </p>
        </div>
        
        <Select 
          value={selectedMonth} 
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
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
              content={<CustomTooltip valueFormatter={valueFormatter} />}
            />
            <Bar 
              dataKey="trades" 
              name="Trades"
              fill="#6E59A5" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {weeklyData.length > 0 ? (
        <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
          <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
          <p className="text-xs md:text-sm text-muted-foreground">
            {selectedMonth !== "all" 
              ? `During ${selectedMonth}, your trading was most active in the week of ${weeklyData.reduce((max, week) => week.trades > max.trades ? week : max, { week: '', trades: 0 }).week}.`
              : `Your trading activity peaks in the middle of the week, with ${weeklyData.reduce((max, week) => week.trades > max.trades ? week : max, { week: '', trades: 0 }).trades} trades in the busiest week.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
          <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
          <p className="text-xs md:text-sm text-muted-foreground">
            No trading data available for the selected period.
          </p>
        </div>
      )}
    </Card>
  );
};
