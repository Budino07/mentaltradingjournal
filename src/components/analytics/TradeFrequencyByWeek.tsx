
import { useState } from "react";
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
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { 
  format, 
  parseISO, 
  getMonth, 
  getYear, 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval,
  getDate,
  isLastDayOfMonth
} from "date-fns";
import { CustomTooltip } from "./shared/CustomTooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TradeFrequencyByWeek = () => {
  // Current month as default (0-based index)
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
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

  // Month names for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get current year
  const currentYear = getYear(new Date());

  // Function to get standard weeks in the selected month (usually 4-5 weeks)
  const getWeeksInMonth = (month: number, year: number) => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    
    // Get all weeks that touch this month
    const allWeeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 0 } // 0 for Sunday
    );
    
    // Limit to 5 weeks maximum for consistency and merging partial weeks
    const normalizedWeeks: Date[] = [];
    
    if (allWeeks.length <= 5) {
      // If 5 or fewer weeks, use all of them
      normalizedWeeks.push(...allWeeks);
    } else {
      // If more than 5 weeks, merge any partial weeks at start/end
      // For example, if the month has 6 weeks with small partial weeks
      
      // Always include the first 4 weeks
      normalizedWeeks.push(...allWeeks.slice(0, 4));
      
      // Use the last week to represent the rest of the month
      normalizedWeeks.push(allWeeks[allWeeks.length - 1]);
    }
    
    return normalizedWeeks;
  };

  // Initialize week counts with normalized week labels
  const initializeWeekCounts = () => {
    const weeks = getWeeksInMonth(selectedMonth, currentYear);
    const weekCounts: Record<string, number> = {};
    
    weeks.forEach((weekStart, index) => {
      // Always label as Week 1, Week 2, etc.
      weekCounts[`Week ${index + 1}`] = 0;
    });
    
    return weekCounts;
  };

  const weekCounts = initializeWeekCounts();

  // Process trades for the selected month
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
      
      // Only count trades from the selected month
      if (getMonth(tradeDate) === selectedMonth && getYear(tradeDate) === currentYear) {
        // Get week number relative to the start of the month
        const monthStart = startOfMonth(tradeDate);
        const weeksInMonth = getWeeksInMonth(selectedMonth, currentYear);
        
        // For trades at the end of the month that might fall into a partial week,
        // assign them to the last full week
        if (isLastDayOfMonth(tradeDate) && getDate(tradeDate) <= 3) {
          const weekLabel = `Week ${weeksInMonth.length}`;
          weekCounts[weekLabel] = (weekCounts[weekLabel] || 0) + 1;
          processedTradeIds.add(trade.id);
          return;
        }
        
        // Find which week of the month this trade falls into
        for (let i = 0; i < weeksInMonth.length; i++) {
          const weekStart = weeksInMonth[i];
          // For the last week, the end is the end of the month
          const nextWeekStart = i < weeksInMonth.length - 1 
            ? weeksInMonth[i + 1] 
            : new Date(endOfMonth(tradeDate).getTime() + 1); // Add 1ms to include the end day
          
          if (tradeDate >= weekStart && tradeDate < nextWeekStart) {
            const weekLabel = `Week ${i + 1}`;
            weekCounts[weekLabel] = (weekCounts[weekLabel] || 0) + 1;
            break;
          }
        }
      }
      
      // Mark this trade as processed
      processedTradeIds.add(trade.id);
    });
  });

  // Convert week counts to chart data format
  const data = Object.entries(weekCounts).map(([weekLabel, trades]) => ({
    week: weekLabel,
    trades: trades,
  }));

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const totalTrades = data.reduce((sum, week) => sum + week.trades, 0);
  const averageTrades = data.length > 0 ? totalTrades / data.length : 0;
  
  const valueFormatter = (value: number) => `${value} trades`;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Trade Frequency By Week</h3>
          <p className="text-sm text-muted-foreground">
            Number of trades by week for {months[selectedMonth]}
          </p>
        </div>
        
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
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
              cursor={{ fill: 'transparent' }}
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

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">Weekly Analysis</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {totalTrades > 0 
            ? `You made ${totalTrades} trades in ${months[selectedMonth]}, averaging ${averageTrades.toFixed(1)} trades per week.`
            : `No trades recorded for ${months[selectedMonth]}.`}
        </p>
      </div>
    </Card>
  );
};
