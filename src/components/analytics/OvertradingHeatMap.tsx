
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { format, parse, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeatMapCell {
  hour: string;
  count: number;
  intensity: "low" | "medium" | "high";
}

export const OvertradingHeatMap = () => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("30");
  
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

  // Calculate all trades for the period
  const allTrades = analytics.journalEntries.flatMap(entry => {
    return (entry.trades || []).map(trade => {
      // Use trade entry date if available, otherwise use journal entry date
      const tradeDate = trade.entryDate ? new Date(trade.entryDate) : new Date(entry.created_at);
      
      // Extract hour
      const hour = tradeDate.getHours();
      
      return {
        date: tradeDate,
        hour,
        emotion: entry.emotion || "neutral"
      };
    });
  });

  // Filter trades based on selected time period
  const timePeriodDays = parseInt(selectedTimePeriod);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timePeriodDays);
  
  const filteredTrades = allTrades.filter(trade => trade.date >= cutoffDate);
  
  // Calculate average trades per day
  const uniqueDays = new Set(filteredTrades.map(trade => format(trade.date, 'yyyy-MM-dd')));
  const avgTradesPerDay = uniqueDays.size > 0 
    ? filteredTrades.length / uniqueDays.size 
    : 0;
  
  // Set overtrading threshold (30% above average)
  const overtradingThreshold = avgTradesPerDay * 1.3;

  // Generate hours for the heat map
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Count trades per hour
  const tradesByHour: Record<number, number> = {};
  hours.forEach(hour => {
    tradesByHour[hour] = filteredTrades.filter(trade => trade.hour === hour).length;
  });
  
  // Calculate average trades per hour
  const avgTradesPerHour = filteredTrades.length / 24;
  
  // Generate heat map data
  const heatMapData: HeatMapCell[] = hours.map(hour => {
    const count = tradesByHour[hour] || 0;
    let intensity: "low" | "medium" | "high" = "low";
    
    // Calculate intensity based on overtrading threshold
    if (count > 0) {
      const hourlyThreshold = overtradingThreshold / 8; // Assuming 8 active trading hours
      if (count >= hourlyThreshold) {
        intensity = "high";
      } else if (count >= hourlyThreshold * 0.7) {
        intensity = "medium";
      }
    }
    
    return {
      hour: hour.toString().padStart(2, '0'),
      count,
      intensity
    };
  });
  
  // Color mapping for intensity
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "bg-red-500/90";
      case "medium":
        return "bg-yellow-500/80";
      case "low":
        return "bg-green-500/70";
      default:
        return "bg-green-500/70";
    }
  };
  
  // Format hours for display
  const formatHour = (hour: string) => {
    const hourNum = parseInt(hour);
    return hourNum === 0 ? "12 AM" : 
           hourNum === 12 ? "12 PM" : 
           hourNum < 12 ? `${hourNum} AM` : 
           `${hourNum - 12} PM`;
  };

  // Calculate percentage of days with overtrading
  const daysWithOvertradingCount = Array.from(uniqueDays).filter(day => {
    const dayTrades = filteredTrades.filter(trade => 
      format(trade.date, 'yyyy-MM-dd') === day
    );
    return dayTrades.length > overtradingThreshold;
  }).length;
  
  const overtradingPercentage = uniqueDays.size > 0
    ? (daysWithOvertradingCount / uniqueDays.size) * 100
    : 0;

  // Calculate most active trading hour
  const mostActiveHour = Object.entries(tradesByHour)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)
    .map(([hour]) => hour)[0] || "N/A";

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Overtrading Heat Map</h3>
          <p className="text-sm text-muted-foreground">
            Visualize trading activity intensity by hour of day
          </p>
        </div>
        <Select
          value={selectedTimePeriod}
          onValueChange={setSelectedTimePeriod}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Past 7 days</SelectItem>
            <SelectItem value="30">Past 30 days</SelectItem>
            <SelectItem value="90">Past 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5 py-2">
        {heatMapData.map((cell) => (
          <div key={cell.hour} className="flex flex-col items-center">
            <div 
              className={`relative w-8 h-16 rounded-md ${
                cell.count > 0 ? getIntensityColor(cell.intensity) : "bg-muted"
              } flex items-center justify-center`}
            >
              {cell.count > 0 && (
                <span className="text-xs font-semibold text-white">{cell.count}</span>
              )}
            </div>
            <span className="text-xs mt-1">{formatHour(cell.hour)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
          <span className="text-xs">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <span className="text-xs">Approaching Threshold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
          <span className="text-xs">Overtrading</span>
        </div>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {filteredTrades.length === 0 ? (
            "No trading data available for the selected period."
          ) : (
            <>
              Your average is {avgTradesPerDay.toFixed(1)} trades per day. 
              {overtradingPercentage > 20 ? (
                ` You've been overtrading on ${overtradingPercentage.toFixed(0)}% of trading days.`
              ) : (
                " Your trading frequency is consistent with your historical patterns."
              )}
              {mostActiveHour !== "N/A" && (
                ` Most active trading hour: ${formatHour(mostActiveHour)}.`
              )}
            </>
          )}
        </p>
      </div>
    </Card>
  );
};
