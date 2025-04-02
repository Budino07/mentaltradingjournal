
import { Card } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
        <p className="text-sm font-medium">{payload[0].payload.trait}</p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current:</span>
            <span className="text-xs font-medium">{payload[0].value}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Previous:</span>
            <span className="text-xs font-medium">{payload[0].payload.previous}%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1.5 border-t border-border pt-1.5">
            {payload[0].payload.description}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Trait descriptions for tooltips
const traitDescriptions = {
  "Win %": "Percentage of profitable trades out of all trades",
  "Profit Factor": "Ratio of gross profits to gross losses",
  "Avg Win/Loss": "Average winning trade amount divided by average losing trade amount",
  "Recovery Factor": "How quickly you recover from drawdowns",
  "Max Drawdown": "Maximum percentage decline from peak to trough",
  "Consistency": "How consistent your trading results are over time"
};

export const PersonalityPatterns = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[300px] md:h-[350px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // ================ Calculation Logic ================
  const entries = analytics.journalEntries;
  const totalEntries = entries.length;
  
  // Calculate win percentage
  const allTrades = entries.flatMap(entry => entry.trades || []);
  const winningTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl > 0;
  });
  const winPercentage = totalEntries > 0 && allTrades.length > 0 
    ? Math.round((winningTrades.length / allTrades.length) * 100)
    : 0;
  
  // Calculate profit factor
  const grossProfit = winningTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + (pnl > 0 ? pnl : 0);
  }, 0);
  
  const losingTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl < 0;
  });
  
  const grossLoss = losingTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + Math.abs(pnl);
  }, 0);
  
  const profitFactor = grossLoss > 0 ? Math.min(100, Math.round((grossProfit / grossLoss) * 50)) : 0;
  
  // Calculate average win/loss ratio
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                   typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0) / winningTrades.length
    : 0;
  
  const avgLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                   typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + Math.abs(pnl);
      }, 0) / losingTrades.length
    : 0;
  
  const avgWinLossRatio = avgLoss > 0 ? Math.min(100, Math.round((avgWin / avgLoss) * 50)) : 0;
  
  // Calculate recovery factor (how quickly trader bounces back from losses)
  const recoveryFactor = entries.reduce((acc, entry, index) => {
    if (index === 0) return acc;
    const prevEntry = entries[index - 1];
    const recoveredFromLoss = 
      prevEntry.outcome === 'loss' && 
      (entry.emotion === 'positive' || 
       (entry.trades && entry.trades.some(t => {
         const pnl = typeof t.pnl === 'string' ? parseFloat(t.pnl) : 
                    typeof t.pnl === 'number' ? t.pnl : 0;
         return pnl > 0;
       })));
    return acc + (recoveredFromLoss ? 1 : 0);
  }, 0);
  
  const recoveryFactorPercentage = totalEntries > 1 
    ? Math.round((recoveryFactor / (totalEntries - 1)) * 100) 
    : 0;
  
  // Calculate max drawdown
  const dailyBalances = entries.map(entry => {
    const dailyPnL = (entry.trades || []).reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                 typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + pnl;
    }, 0);
    return dailyPnL;
  });

  let maxDrawdown = 0;
  let peak = 0;
  let currentDrawdown = 0;

  dailyBalances.forEach(balance => {
    peak = Math.max(peak, balance);
    currentDrawdown = Math.max(0, peak - balance);
    maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
  });

  const maxDrawdownPercentage = peak > 0 
    ? Math.min(100, Math.round((1 - (maxDrawdown / peak)) * 100)) 
    : 100;
  
  // Calculate consistency (standard deviation of daily returns, inverted)
  const dailyReturns = entries.map(entry => {
    return (entry.trades || []).reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                 typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + pnl;
    }, 0);
  });
  
  const mean = dailyReturns.reduce((sum, ret) => sum + ret, 0) / (dailyReturns.length || 1);
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (dailyReturns.length || 1);
  const stdDev = Math.sqrt(variance);
  
  // Invert stdDev so lower volatility = higher score
  // Cap at 100 for better visualization
  const consistencyScore = stdDev > 0 
    ? Math.min(100, Math.round(100 / (1 + stdDev / Math.abs(mean || 1)))) 
    : 50;

  // Prepare radar chart data with descriptions
  const data = [
    { 
      trait: "Win %", 
      current: winPercentage,
      previous: Math.max(0, winPercentage - 5),
      description: traitDescriptions["Win %"]
    },
    { 
      trait: "Profit Factor", 
      current: profitFactor,
      previous: Math.max(0, profitFactor - 10),
      description: traitDescriptions["Profit Factor"]
    },
    { 
      trait: "Avg Win/Loss", 
      current: avgWinLossRatio,
      previous: Math.max(0, avgWinLossRatio - 8),
      description: traitDescriptions["Avg Win/Loss"]
    },
    { 
      trait: "Recovery Factor", 
      current: recoveryFactorPercentage,
      previous: Math.max(0, recoveryFactorPercentage - 12),
      description: traitDescriptions["Recovery Factor"]
    },
    { 
      trait: "Max Drawdown", 
      current: maxDrawdownPercentage,
      previous: Math.max(0, maxDrawdownPercentage - 7),
      description: traitDescriptions["Max Drawdown"]
    },
    { 
      trait: "Consistency", 
      current: consistencyScore,
      previous: Math.max(0, consistencyScore - 10),
      description: traitDescriptions["Consistency"]
    },
  ];

  // Generate insights based on the scores
  const generateInsights = () => {
    const sortedTraits = [...data].sort((a, b) => b.current - a.current);
    const highestTrait = sortedTraits[0];
    const lowestTrait = sortedTraits[sortedTraits.length - 1];
    
    return {
      strength: `Your ${highestTrait.trait.toLowerCase()} is your strongest trait at ${highestTrait.current}%, indicating a strong ${highestTrait.trait === "Win %" ? "ability to identify profitable trades" : 
                 highestTrait.trait === "Profit Factor" ? "return on investment" :
                 highestTrait.trait === "Avg Win/Loss" ? "reward-to-risk ratio" :
                 highestTrait.trait === "Recovery Factor" ? "resilience after losses" :
                 highestTrait.trait === "Max Drawdown" ? "capital preservation skill" :
                 "consistency in your trading approach"}.`,
      improvement: `Focus on improving your ${lowestTrait.trait.toLowerCase()}, currently at ${lowestTrait.current}%, by ${lowestTrait.trait === "Win %" ? "being more selective with trade entries" : 
                    lowestTrait.trait === "Profit Factor" ? "letting winners run longer" :
                    lowestTrait.trait === "Avg Win/Loss" ? "setting wider profit targets" :
                    lowestTrait.trait === "Recovery Factor" ? "developing better post-loss strategies" :
                    lowestTrait.trait === "Max Drawdown" ? "tightening your risk management" :
                    "maintaining more consistent position sizing"}.`
    };
  };

  const insights = generateInsights();

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xl md:text-2xl font-bold">Trading Personality</h3>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  This radar chart shows six key aspects of your trading personality based on your journal entries. Hover over each axis for more details.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">
            Analysis of your trading style based on journal data
          </p>
        </div>
      </div>

      <div className="h-[300px] md:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid strokeOpacity={0.2} />
            <PolarAngleAxis 
              dataKey="trait"
              tick={{ 
                fill: 'currentColor', 
                fontSize: 12,
                fontWeight: 500
              }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]}
              axisLine={false}
              tick={{ fill: 'currentColor', fontSize: 10 }}
              tickCount={5}
              opacity={0.5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#9b87f5"
              fill="#9b87f5"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Previous Month"
              dataKey="previous"
              stroke="#0EA5E9"
              fill="#0EA5E9"
              fillOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <Separator className="my-1" />

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
          <span>AI Insight</span>
        </h4>
        <div className="space-y-3 text-xs md:text-sm text-muted-foreground">
          <p>{insights.strength}</p>
          <p>{insights.improvement}</p>
        </div>
      </div>
    </Card>
  );
};
