
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { TimeFilter } from "@/hooks/useJournalFilters";
import { startOfMonth, subMonths, isWithinInterval, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface TradeWinPercentageProps {
  timeFilter: TimeFilter;
  hasEntries: boolean;
}

export const TradeWinPercentage = ({ timeFilter, hasEntries }: TradeWinPercentageProps) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const getTimeInterval = () => {
    const now = new Date();
    switch (timeFilter) {
      case "this-month":
        return {
          start: startOfMonth(now),
          end: now
        };
      case "last-month":
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case "last-three-months":
        return {
          start: startOfMonth(subMonths(now, 3)),
          end: now
        };
      case "last-year":
        return {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1))
        };
      default:
        return null;
    }
  };

  const calculateWinRate = () => {
    if (!analytics?.journalEntries || analytics.journalEntries.length === 0) return 0;

    // Get entries within the time filter
    let timeFilteredEntries = analytics.journalEntries;
    const interval = getTimeInterval();
    if (interval) {
      timeFilteredEntries = timeFilteredEntries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return isWithinInterval(entryDate, interval);
      });
    }

    if (timeFilteredEntries.length === 0) return 0;

    // Get all trades from all entries
    const allTrades = timeFilteredEntries.flatMap(entry => entry.trades || []);
    
    // Filter out trades with undefined or NaN PnL
    const validTrades = allTrades.filter(trade => {
      const pnl = Number(trade.pnl);
      return !isNaN(pnl);
    });

    // If there are no valid trades, return 0
    if (validTrades.length === 0) return 0;

    const winningTrades = validTrades.filter(trade => Number(trade.pnl) > 0);
    return (winningTrades.length / validTrades.length) * 100;
  };

  const winRate = calculateWinRate();
  
  // Calculate the data for the pie chart
  const pieData = hasEntries ? [
    { name: "Wins", value: winRate, color: "#6E59A5" },
    { name: "Losses", value: 100 - winRate, color: "#FEC6A1" }
  ] : [
    { name: "No Data", value: 100, color: "#e5e7eb" }
  ];

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-16 bg-muted rounded"></div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Trade Win %</span>
        <ArrowUpDown className="h-4 w-4 text-primary" />
      </div>
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-foreground">
          {hasEntries ? winRate.toFixed(1) : '0.0'}%
        </div>
        <div className="h-12 w-12">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={14}
                outerRadius={24}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
