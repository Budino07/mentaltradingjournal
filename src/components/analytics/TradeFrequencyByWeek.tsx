
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
import { format, parseISO, getWeek, getMonth, getYear } from "date-fns";
import { CustomTooltip } from "./shared/CustomTooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TradeFrequencyByWeek = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  
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

  // Process all trades from journal entries grouping by week
  const weekCounts: Record<string, { count: number; pnl: number }> = {};
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
      
      const tradeMonth = format(tradeDate, 'MMMM');
      
      // Skip if filtering by month and this trade isn't in the selected month
      if (selectedMonth !== "all" && tradeMonth !== selectedMonth) return;
      
      const year = getYear(tradeDate);
      const week = getWeek(tradeDate);
      const weekKey = `Week ${week}, ${year}`;
      
      if (!weekCounts[weekKey]) {
        weekCounts[weekKey] = { count: 0, pnl: 0 };
      }
      
      weekCounts[weekKey].count++;
      
      // Add the trade's P&L to the weekly total
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                  typeof trade.pnl === 'number' ? trade.pnl : 0;
      weekCounts[weekKey].pnl += pnl;
      
      // Mark this trade as processed
      processedTradeIds.add(trade.id);
    });
  });

  // Convert week counts to chart data format
  const data = Object.entries(weekCounts)
    .map(([week, stats]) => ({
      week,
      trades: stats.count,
      pnl: stats.pnl
    }))
    .sort((a, b) => {
      // Extract week numbers for sorting
      const weekNumA = parseInt(a.week.split(' ')[1]);
      const weekNumB = parseInt(b.week.split(' ')[1]);
      const yearA = parseInt(a.week.split(', ')[1]);
      const yearB = parseInt(b.week.split(', ')[1]);
      
      if (yearA !== yearB) return yearA - yearB;
      return weekNumA - weekNumB;
    });

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const valueFormatter = (value: number) => `${value} trades`;

  const monthWithMostTrades = selectedMonth === "all" 
    ? months.reduce((maxMonth, month) => {
        const monthTrades = analytics.journalEntries
          .flatMap(entry => entry.trades || [])
          .filter(trade => !processedTradeIds.has(trade.id || ''))
          .filter(trade => {
            const tradeDate = trade.entryDate 
              ? parseISO(trade.entryDate)
              : null;
            return tradeDate && format(tradeDate, 'MMMM') === month;
          }).length;
        
        return monthTrades > (analytics.journalEntries
          .flatMap(entry => entry.trades || [])
          .filter(trade => !processedTradeIds.has(trade.id || ''))
          .filter(trade => {
            const tradeDate = trade.entryDate 
              ? parseISO(trade.entryDate)
              : null;
            return tradeDate && format(tradeDate, 'MMMM') === maxMonth;
          }).length) ? month : maxMonth;
      }, months[0])
    : selectedMonth;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold">Trade Frequency By Week</h3>
          <p className="text-sm text-muted-foreground">
            Distribution of trades across different weeks
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
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

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {data.length > 0 
            ? `Your weekly trading frequency shows ${selectedMonth === "all" 
                ? `highest activity in ${monthWithMostTrades}` 
                : `${data.reduce((sum, week) => sum + week.trades, 0)} trades in ${selectedMonth}`}.`
            : `No trading data available ${selectedMonth !== "all" ? `for ${selectedMonth}` : ""}.`}
        </p>
      </div>
    </Card>
  );
};
