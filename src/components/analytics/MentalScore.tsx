
import { Card } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { Trade } from "@/types/trade";
import { JournalEntryType } from "@/types/journal";

// Calculate the mental score metrics from journal entries and trades
const calculateMentalMetrics = (journalEntries: JournalEntryType[]) => {
  if (!journalEntries.length) {
    return {
      score: 0,
      metrics: [],
      insights: { strength: "", weakness: "" }
    };
  }

  // Extract all trades
  const allTrades = journalEntries.flatMap(entry => 
    (entry.trades || []).map(trade => ({
      ...trade,
      pnl: typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
           (typeof trade.pnl === 'number' ? trade.pnl : 0),
    }))
  );

  // Calculate win percentage
  const winningTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl > 0;
  });
  
  const winPercentage = allTrades.length > 0 
    ? Math.round((winningTrades.length / allTrades.length) * 100) 
    : 0;

  // Calculate profit factor
  const grossProfit = winningTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + pnl;
  }, 0);
  
  const losingTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl < 0;
  });
  
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + pnl;
  }, 0));
  
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 10) / 10 : 0;

  // Calculate average win/loss ratio
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0) / winningTrades.length 
    : 0;
    
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0)) / losingTrades.length 
    : 0;
    
  const avgWinLossRatio = avgLoss > 0 ? Math.round((avgWin / avgLoss) * 10) / 10 : 0;

  // Calculate recovery factor
  const maxDrawdown = calculateMaxDrawdown(allTrades);
  const netProfit = allTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + pnl;
  }, 0);
  
  const recoveryFactor = maxDrawdown > 0 ? Math.round((netProfit / maxDrawdown) * 10) / 10 : 0;

  // Calculate consistency
  const dailyResults = journalEntries.reduce((acc: Record<string, number>, entry) => {
    const date = new Date(entry.created_at).toISOString().split('T')[0];
    const dailyPnl = (entry.trades || []).reduce(
      (sum, trade) => {
        const tradePnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                        (typeof trade.pnl === 'number' ? trade.pnl : 0);
        return sum + tradePnl;
      }, 
      0
    );
    
    if (!acc[date]) acc[date] = 0;
    acc[date] += dailyPnl;
    return acc;
  }, {} as Record<string, number>);
  
  const profitableDays = Object.values(dailyResults).filter(pnl => pnl > 0).length;
  const totalDays = Object.keys(dailyResults).length;
  const consistency = totalDays > 0 ? Math.round((profitableDays / totalDays) * 100) : 0;

  // Create normalized scores (0-100)
  const normalizeScore = (value: number, max: number) => Math.min(Math.round((value / max) * 100), 100);

  const metrics = [
    { name: "Win %", value: winPercentage, fullMark: 100, description: "Percentage of profitable trades", originalValue: `${winPercentage}%` },
    { name: "Profit Factor", value: normalizeScore(profitFactor, 3), fullMark: 100, description: "Ratio of gross profit to gross loss", originalValue: profitFactor.toFixed(1) },
    { name: "Avg Win/Loss", value: normalizeScore(avgWinLossRatio, 3), fullMark: 100, description: "Average win amount divided by average loss amount", originalValue: avgWinLossRatio.toFixed(1) },
    { name: "Recovery Factor", value: normalizeScore(recoveryFactor, 3), fullMark: 100, description: "Net profit divided by max drawdown", originalValue: recoveryFactor.toFixed(1) },
    { name: "Max Drawdown", value: 100 - normalizeScore(maxDrawdown, 5000), fullMark: 100, description: "Largest peak-to-trough decline", originalValue: `$${maxDrawdown.toFixed(0)}` },
    { name: "Consistency", value: consistency, fullMark: 100, description: "Percentage of profitable days", originalValue: `${consistency}%` },
  ];

  // Calculate overall mental score (weighted average)
  const weights = {
    "Win %": 0.15,
    "Profit Factor": 0.2,
    "Avg Win/Loss": 0.2,
    "Recovery Factor": 0.15,
    "Max Drawdown": 0.1,
    "Consistency": 0.2,
  };

  const weightedSum = metrics.reduce((sum, metric) => 
    sum + metric.value * weights[metric.name as keyof typeof weights], 0
  );
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // Generate insights
  const sortedMetrics = [...metrics].sort((a, b) => b.value - a.value);
  const highestMetric = sortedMetrics[0];
  const lowestMetric = sortedMetrics[sortedMetrics.length - 1];

  // Find the specific setup type with the best performance
  const setupPerformance: Record<string, { count: number, pnl: number }> = {};
  
  // Process all trades to find the most consistent setup
  allTrades.forEach(trade => {
    if (trade.setup) {
      if (!setupPerformance[trade.setup]) {
        setupPerformance[trade.setup] = { count: 0, pnl: 0 };
      }
      setupPerformance[trade.setup].count += 1;
      setupPerformance[trade.setup].pnl += typeof trade.pnl === 'number' ? trade.pnl : 0;
    }
  });
  
  // Find the most frequent setup with positive PnL
  const consistentSetups = Object.entries(setupPerformance)
    .filter(([_, stats]) => stats.count >= 3 && stats.pnl > 0)
    .sort((a, b) => b[1].count - a[1].count);
  
  const topSetup = consistentSetups.length > 0 ? consistentSetups[0][0] : null;

  const insights = {
    strength: highestMetric.name === "Avg Win/Loss" 
      ? `Your trade management skills are excellent, with an average win (${avgWin.toFixed(2)}) ${avgWinLossRatio.toFixed(1)}x larger than your average loss (${avgLoss.toFixed(2)}).`
      : `Your ${highestMetric.name} (${highestMetric.originalValue}) is your strongest mental metric, showing solid psychological resilience in this area.`,
    weakness: lowestMetric.name === "Consistency" 
      ? `Focus on improving your trading consistency (${consistency}% profitable days). ${topSetup ? `Your "${topSetup}" setup has been your most reliable - consider focusing more on this pattern.` : "Try to identify and stick with your most reliable setups."}`
      : `Work on improving your ${lowestMetric.name.toLowerCase()} (${lowestMetric.originalValue}), as this may be limiting your overall trading performance.`
  };

  return {
    score: overallScore,
    metrics,
    insights
  };
};

// Calculate maximum drawdown from a series of trades
const calculateMaxDrawdown = (trades: Trade[]) => {
  if (!trades.length) return 0;
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;
  
  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0;
    const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0;
    return dateA - dateB;
  });
  
  sortedTrades.forEach(trade => {
    const pnlValue = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                     (typeof trade.pnl === 'number' ? trade.pnl : 0);
    runningTotal += pnlValue;
    
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    
    const currentDrawdown = peak - runningTotal;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
  });
  
  return maxDrawdown;
};

// Custom radar dot with tooltips
const CustomizedDot = (props: any) => {
  const { cx, cy, value, payload, index } = props;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <circle 
            cx={cx} 
            cy={cy} 
            r={5} 
            fill="#6366F1" 
            stroke="#fff" 
            strokeWidth={2} 
            style={{ cursor: 'pointer' }}
          />
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-1 p-2 max-w-[220px]">
          <p className="font-semibold text-sm">{payload.name}: {payload.originalValue}</p>
          <p className="text-xs text-muted-foreground">{payload.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Mental Score Component
export const MentalScore = () => {
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

  const mentalData = calculateMentalMetrics(analytics.journalEntries);
  
  // If no entries, show empty state
  if (analytics.journalEntries.length === 0) {
    return (
      <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-background/95 to-background/80">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Mental Score</h3>
          <p className="text-sm text-muted-foreground">
            Start journaling to see your mental trading metrics
          </p>
        </div>
        <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
          <p>No journal entries found</p>
          <p className="text-sm">Add journal entries to see your mental score analysis</p>
        </div>
      </Card>
    );
  }

  // Rating based on score
  const getRating = (score: number) => {
    if (score >= 90) return "Elite";
    if (score >= 80) return "Advanced";
    if (score >= 70) return "Proficient";
    if (score >= 60) return "Intermediate";
    if (score >= 50) return "Developing";
    return "Novice";
  };

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981"; // Green
    if (score >= 60) return "#3B82F6"; // Blue
    if (score >= 40) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  return (
    <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Mental Score</h3>
          <p className="text-sm text-muted-foreground">
            Psychological trading metrics
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="text-sm">
                Your Mental Score measures the psychological aspects of your trading.
                It combines metrics like win rate, consistency, and recovery ability
                to give an overall score of your trading psychology.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Display */}
        <div className="flex flex-col items-center justify-center space-y-2 bg-accent/10 rounded-lg p-4">
          <div className="text-5xl font-bold" style={{ color: getScoreColor(mentalData.score) }}>
            {mentalData.score}
          </div>
          <div className="text-sm font-medium">
            {getRating(mentalData.score)}
          </div>
          <div className="w-full bg-background rounded-full h-2.5 mt-2">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${mentalData.score}%`, 
                backgroundColor: getScoreColor(mentalData.score) 
              }}
            ></div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Your Mental Trading Score
          </p>
        </div>

        {/* Radar Chart */}
        <div className="md:col-span-2 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mentalData.metrics}>
              <PolarGrid className="text-muted-foreground/15" stroke="#444455" />
              <PolarAngleAxis 
                dataKey="name"
                tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
                stroke="transparent"
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                tick={{ fill: 'currentColor', fontSize: 10 }}
                axisLine={false}
                tickCount={4}
                stroke="#444455"
              />
              <Radar
                name="Mental Metrics"
                dataKey="value"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.6}
                dot={<CustomizedDot />}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm md:text-base">Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-accent/10 p-3 rounded-lg">
            <h5 className="text-sm font-medium">Strength</h5>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{mentalData.insights.strength}</p>
          </div>
          <div className="bg-accent/10 p-3 rounded-lg">
            <h5 className="text-sm font-medium">Area for Improvement</h5>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{mentalData.insights.weakness}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
