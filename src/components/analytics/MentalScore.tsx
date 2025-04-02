
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Process trades to calculate metrics
  const allTrades = analytics.journalEntries.flatMap(entry => entry.trades || []);
  const validTrades = allTrades.filter(trade => typeof trade.pnl === 'number' || 
    (typeof trade.pnl === 'string' && !isNaN(parseFloat(trade.pnl))));
  
  if (validTrades.length === 0) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Mental Score</h3>
          <p className="text-sm text-muted-foreground">
            No trade data available yet
          </p>
        </div>
      </Card>
    );
  }

  // Calculate key metrics for mental score
  const winningTrades = validTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
    return pnl > 0;
  });
  
  // Win percentage
  const winPercentage = (winningTrades.length / validTrades.length) * 100;
  
  // Profit factor (total gains / total losses)
  const gains = validTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
    return sum + (pnl > 0 ? pnl : 0);
  }, 0);
  
  const losses = validTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
    return sum + (pnl < 0 ? Math.abs(pnl) : 0);
  }, 0);
  
  const profitFactor = losses > 0 ? gains / losses : gains > 0 ? 2 : 0;
  
  // Average win/loss ratio
  const avgWin = winningTrades.length > 0 ? 
    winningTrades.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
      return sum + pnl;
    }, 0) / winningTrades.length : 0;
  
  const losingTrades = validTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
    return pnl < 0;
  });
  
  const avgLoss = losingTrades.length > 0 ? 
    losingTrades.reduce((sum, trade) => {
      const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
      return sum + Math.abs(pnl);
    }, 0) / losingTrades.length : 0;
  
  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 2 : 0;
  
  // Estimated recovery factor (net profit / max drawdown)
  const totalPnL = validTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
    return sum + pnl;
  }, 0);
  
  // Simple estimation of max drawdown
  const maxDrawdown = Math.max(
    losses,
    losingTrades.length > 2 ? losingTrades.length * avgLoss * 0.5 : avgLoss * 2
  );
  
  const recoveryFactor = maxDrawdown > 0 ? Math.abs(totalPnL) / maxDrawdown : 1;
  
  // Consistency (standard deviation of returns)
  const returns = validTrades.map(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : trade.pnl;
    return pnl;
  });
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const squaredDiffs = returns.map(ret => Math.pow(ret - avgReturn, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize stdDev to a 0-100 scale where lower is better (more consistent)
  const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / (avgReturn || 1) * 20)));
  
  // Calculate overall mental score (0-100)
  const mentalScore = Math.min(100, Math.max(0, Math.round(
    (winPercentage * 0.25) + 
    (Math.min(profitFactor, 2) * 25) + 
    (Math.min(winLossRatio, 2) * 10) + 
    (Math.min(recoveryFactor, 1) * 15) + 
    (consistencyScore * 0.25)
  )));
  
  // Radar chart data
  const radarData = [
    { trait: "Win %", value: Math.min(100, Math.max(0, winPercentage)), fullMark: 100 },
    { trait: "Profit Factor", value: Math.min(100, Math.max(0, profitFactor * 50)), fullMark: 100 },
    { trait: "Win/Loss", value: Math.min(100, Math.max(0, winLossRatio * 50)), fullMark: 100 },
    { trait: "Recovery", value: Math.min(100, Math.max(0, recoveryFactor * 100)), fullMark: 100 },
    { trait: "Max DD", value: Math.min(100, Math.max(0, 100 - (maxDrawdown / (totalPnL || 1) * 20))), fullMark: 100 },
    { trait: "Consistency", value: consistencyScore, fullMark: 100 },
  ];

  // Interpret the mental score
  const getScoreDescription = (score: number) => {
    if (score >= 90) return "Elite Mental Game";
    if (score >= 80) return "Strong Mental Game";
    if (score >= 70) return "Good Mental Game";
    if (score >= 60) return "Developing Mental Game";
    if (score >= 50) return "Average Mental Game";
    if (score >= 40) return "Needs Improvement";
    return "Early Development Stage";
  };

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold">Mental Score</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Trading psychology assessment
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-3.5 w-3.5 ml-1 text-muted-foreground/70" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-xs">Mental Score measures your trading psychology strength based on win percentage, profit factor, win/loss ratio, recovery factor, drawdown management, and consistency.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{mentalScore}</div>
          <div className="text-sm text-muted-foreground">{getScoreDescription(mentalScore)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={mentalScore} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Developing</span>
          <span>Strong</span>
          <span>Elite</span>
        </div>
      </div>

      <div className="h-[200px] md:h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="65%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12, fill: 'currentColor' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar 
              name="Mental Traits" 
              dataKey="value" 
              stroke="#7C3AED" 
              fill="#7C3AED" 
              fillOpacity={0.4} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {mentalScore >= 75 ? (
            "Your strong mental game is a significant trading edge. Continue leveraging your discipline and emotional control for consistent results."
          ) : mentalScore >= 60 ? (
            "You're developing a resilient trading mindset. Focus on improving consistency and drawdown management to strengthen your mental game."
          ) : (
            "Building your mental game is your biggest opportunity for improvement. Focus on maintaining discipline and developing a structured approach to handle emotions."
          )}
        </p>
      </div>
    </Card>
  );
};
