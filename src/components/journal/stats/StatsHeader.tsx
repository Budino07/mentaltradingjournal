import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { formatDate } from "@/utils/dateUtils";
import { Separator } from "@/components/ui/separator";
import { useTimeFilter } from "@/contexts/TimeFilterContext";
import { Badge } from "@/components/ui/badge";

interface StatsHeaderProps {
  totalDays: number;
  winRate: number;
  averageRR: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  lastTradeDate?: Date | null;
  currentStreak: number;
  bestStreak: number;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({
  totalDays,
  winRate,
  averageRR,
  totalTrades,
  winningTrades,
  losingTrades,
  lastTradeDate,
  currentStreak,
  bestStreak,
}) => {
  const { selectedRange } = useDashboardContext();
  const { timeFilter } = useTimeFilter();

  // Within the component, add a helper function to handle string dates:
  const formatDateFromString = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDate(date);
  };

  return (
    <Card className="col-span-4 md:col-span-8 lg:col-span-12">
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
        {/* Total Days */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{totalDays}</span>
          <span className="text-sm text-muted-foreground">Total Days</span>
        </div>
        
        {/* Win Rate */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{winRate.toFixed(0)}%</span>
          <span className="text-sm text-muted-foreground">Win Rate</span>
        </div>
        
        {/* Average RR */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{averageRR.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">Avg R:R</span>
        </div>

        <Separator orientation="horizontal" className="col-span-1 sm:col-span-2 md:hidden" />
        
        {/* Total Trades */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{totalTrades}</span>
          <span className="text-sm text-muted-foreground">Total Trades</span>
        </div>
        
        {/* Winning Trades */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{winningTrades}</span>
          <span className="text-sm text-muted-foreground">Winning Trades</span>
        </div>
        
        {/* Losing Trades */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{losingTrades}</span>
          <span className="text-sm text-muted-foreground">Losing Trades</span>
        </div>

        <Separator orientation="horizontal" className="col-span-1 sm:col-span-2 md:hidden" />

        {/* Current Streak */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">Current Streak</span>
        </div>

        {/* Best Streak */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{bestStreak}</span>
          <span className="text-sm text-muted-foreground">Best Streak</span>
        </div>

        {/* Last Trade Date */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl font-semibold">
            {lastTradeDate ? formatDateFromString(lastTradeDate.toISOString()) : 'No Trades Yet'}
          </span>
          <span className="text-sm text-muted-foreground">Last Trade</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsHeader;
