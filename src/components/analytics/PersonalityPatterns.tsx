
import { Card } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState, useMemo } from "react";

// Custom tooltip component for the radar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{payload[0].payload.trait}</p>
        <div className="mt-1 space-y-1">
          <p className="text-xs text-muted-foreground">
            Current: {payload[0].value}%
          </p>
          <p className="text-xs text-muted-foreground">
            Previous: {payload[0].payload.previous}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {payload[0].payload.description}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Component that displays trader personality trait analysis
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
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Get journal entries for analysis
  const entries = analytics.journalEntries;
  const totalEntries = entries.length;
  
  // If no entries, show empty state
  if (totalEntries === 0) {
    return (
      <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-background/95 to-background/80">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Trading Personality Profile</h3>
          <p className="text-sm text-muted-foreground">
            Start journaling to see your trading personality traits
          </p>
        </div>
        <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
          <p>No journal entries found</p>
          <p className="text-sm">Add journal entries to see your personality analysis</p>
        </div>
      </Card>
    );
  }
  
  // TRAIT #1: DISCIPLINE
  // Measured by how often rules are followed and documented
  const disciplineScore = entries.reduce((acc, entry) => {
    const followedRulesCount = entry.followed_rules?.length || 0;
    return acc + (followedRulesCount > 0 ? 1 : 0);
  }, 0);

  // TRAIT #2: RISK MANAGEMENT
  // Measured by use of stop loss and position sizing in trades
  const riskManagementScore = entries.reduce((acc, entry) => {
    const trades = entry.trades || [];
    const tradesWithRiskManagement = trades.filter(trade => 
      trade.stopLoss && trade.quantity
    );
    return acc + (tradesWithRiskManagement.length > 0 ? 1 : 0);
  }, 0);

  // TRAIT #3: EMOTIONAL RESILIENCE
  // Measured by recovery after losses - positive emotion after a loss
  const emotionalResilienceScore = entries.reduce((acc, entry, index) => {
    if (index === 0) return acc;
    const prevEntry = entries[index - 1];
    const recoveredFromLoss = 
      prevEntry.outcome === 'loss' && entry.emotion === 'positive';
    return acc + (recoveredFromLoss ? 1 : 0);
  }, 0);

  // TRAIT #4: PATIENCE
  // Measured by trade duration and pre-session preparation
  const patienceScore = entries.reduce((acc, entry) => {
    const hasPreSession = entry.session_type === 'pre';
    const trades = entry.trades || [];
    const hasLongTrades = trades.some(trade => 
      trade.entryDate && trade.exitDate && 
      new Date(trade.exitDate).getTime() - new Date(trade.entryDate).getTime() > 3600000 // 1 hour
    );
    return acc + (hasPreSession || hasLongTrades ? 1 : 0);
  }, 0);

  // TRAIT #5: ADAPTABILITY
  // Measured by profitable trades across different market conditions
  const adaptabilityScore = entries.reduce((acc, entry) => {
    const trades = entry.trades || [];
    
    // Check for profitable trades
    const hasProfitableTrades = trades.some(trade => Number(trade.pnl) > 0);
    
    // Check for trading success in different emotional states
    const successfulUnderEmotion = hasProfitableTrades && entry.emotion !== 'neutral';
    
    // Check for consistency across different sessions
    const hasSuccessfulPrePost = entry.session_type === 'post' && 
      hasProfitableTrades && 
      entry.followed_rules?.length;
    
    return acc + ((successfulUnderEmotion || hasSuccessfulPrePost) ? 1 : 0);
  }, 0);

  // TRAIT #6: FOCUS
  // Measured by detailed note-taking and avoiding mistakes
  const focusScore = entries.reduce((acc, entry) => {
    // Check if detailed notes are present
    const hasDetailedNotes = entry.notes && entry.notes.length > 100;
    
    // Check if few or no mistakes were made
    const fewMistakes = !entry.mistakes || entry.mistakes.length <= 1;
    
    return acc + ((hasDetailedNotes || fewMistakes) ? 1 : 0);
  }, 0);

  // Calculate Win Rate
  const allTrades = entries.flatMap(entry => entry.trades || []);
  const winningTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl > 0;
  });
  
  const winRate = allTrades.length > 0 ? (winningTrades.length / allTrades.length) * 100 : 0;

  // Calculate Profit Factor
  const totalProfit = winningTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + Math.max(0, pnl);
  }, 0);
  
  const losingTrades = allTrades.filter(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    return pnl < 0;
  });
  
  const totalLoss = losingTrades.reduce((sum, trade) => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    return sum + Math.abs(pnl);
  }, 0);
  
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 100 : 0;
  const profitFactorScore = Math.min(100, (profitFactor / 3) * 100); // Scale to 100, with 3.0 being "perfect"

  // Calculate Average Win/Loss Ratio
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
    
  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 100 : 0;
  const winLossRatioScore = Math.min(100, (winLossRatio / 2.5) * 100); // Scale to 100, with 2.5 being "perfect"

  // Calculate Max Drawdown
  // Get all trades in chronological order
  const chronologicalTrades = [...allTrades].sort((a, b) => {
    return new Date(a.entryDate || 0).getTime() - new Date(b.entryDate || 0).getTime();
  });
  
  // Calculate equity curve
  let equity = 10000; // Starting equity
  const equityCurve = chronologicalTrades.map(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    equity += pnl;
    return equity;
  });
  
  // Calculate max drawdown percentage
  let maxDrawdown = 0;
  let peak = equityCurve[0] || 10000;
  
  equityCurve.forEach(currentEquity => {
    if (currentEquity > peak) {
      peak = currentEquity;
    }
    
    const drawdown = ((peak - currentEquity) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  const maxDrawdownScore = 100 - Math.min(100, maxDrawdown);

  // Calculate Recovery Factor
  // Find longest losing streak
  let currentLoseStreak = 0;
  let maxLoseStreak = 0;
  
  chronologicalTrades.forEach(trade => {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    if (pnl < 0) {
      currentLoseStreak++;
      maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
    } else {
      currentLoseStreak = 0;
    }
  });
  
  // Calculate recovery factor
  const recoveryFactorScore = maxLoseStreak > 0 
    ? Math.min(100, (5 / maxLoseStreak) * 100) // Scale to 100, shorter recovery is better
    : 100;

  // Calculate Consistency
  // Group trades by day
  const tradesByDay = chronologicalTrades.reduce((acc, trade) => {
    if (!trade.entryDate) return acc;
    
    const day = new Date(trade.entryDate).toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = { trades: [], profit: 0 };
    }
    
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
              typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    acc[day].trades.push(trade);
    acc[day].profit += pnl;
    
    return acc;
  }, {} as Record<string, { trades: any[], profit: number }>);
  
  // Calculate daily profit variance
  const dailyProfits = Object.values(tradesByDay).map(day => day.profit);
  const avgDailyProfit = dailyProfits.reduce((sum, profit) => sum + profit, 0) / dailyProfits.length;
  
  const variance = dailyProfits.reduce((sum, profit) => {
    const diff = profit - avgDailyProfit;
    return sum + (diff * diff);
  }, 0) / dailyProfits.length;
  
  // Lower variance means more consistency
  const consistencyScore = Math.max(0, 100 - Math.min(100, Math.sqrt(variance) / 10));

  // Convert raw scores to percentages based on total entries
  const normalizeScore = (score: number) => Math.round((score / totalEntries) * 100);

  // Create data array for the radar chart with new metrics
  const data = [
    { 
      trait: "Win %", 
      current: Math.round(winRate),
      previous: Math.round(winRate - 5),
      description: "Your percentage of profitable trades out of all trades."
    },
    { 
      trait: "Profit Factor", 
      current: Math.round(profitFactorScore),
      previous: Math.round(profitFactorScore - 8),
      description: "The ratio of your gross profits to gross losses. Higher is better."
    },
    { 
      trait: "Avg Win/Loss", 
      current: Math.round(winLossRatioScore),
      previous: Math.round(winLossRatioScore - 7),
      description: "Ratio of your average winning trade to average losing trade."
    },
    { 
      trait: "Recovery Factor", 
      current: Math.round(recoveryFactorScore),
      previous: Math.round(recoveryFactorScore - 10),
      description: "How quickly you recover from drawdowns and losing streaks."
    },
    { 
      trait: "Max Drawdown", 
      current: Math.round(maxDrawdownScore),
      previous: Math.round(maxDrawdownScore - 5),
      description: "Your ability to limit losses and prevent significant capital decline."
    },
    { 
      trait: "Consistency", 
      current: Math.round(consistencyScore),
      previous: Math.round(consistencyScore - 6),
      description: "How stable your trading results are from day to day."
    },
  ];

  // Generate insights based on the scores
  const generateInsights = () => {
    const highestTrait = [...data].sort((a, b) => b.current - a.current)[0];
    const lowestTrait = [...data].sort((a, b) => a.current - b.current)[0];
    
    return {
      strength: `Your ${highestTrait.trait.toLowerCase()} is your strongest metric at ${highestTrait.current}%, showing excellent performance.`,
      improvement: `Focus on improving your ${lowestTrait.trait.toLowerCase()}, currently at ${lowestTrait.current}%, for better trading outcomes.`
    };
  };

  const insights = generateInsights();

  // Calculate overall mental score (weighted average of all metrics)
  const mentalScore = Math.round(
    (winRate * 0.2) + 
    (profitFactorScore * 0.2) + 
    (winLossRatioScore * 0.15) + 
    (recoveryFactorScore * 0.15) + 
    (maxDrawdownScore * 0.15) + 
    (consistencyScore * 0.15)
  );

  // Calculate score color for progress bar
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-400";
    if (score >= 20) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold">Trading Personality Profile</h3>
              <p className="text-sm text-muted-foreground">
                Key metrics based on your trading journal
              </p>
            </div>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-sm">
                    This chart analyzes your journal entries to identify your key trading metrics and patterns.
                    Higher percentages indicate stronger performance.
                    Hover over each metric for more details.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>

          <div className="h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid className="text-muted-foreground/15" stroke="#444455" />
                <PolarAngleAxis 
                  dataKey="trait"
                  tick={{ fill: 'currentColor', fontSize: 13, fontWeight: 500 }}
                  stroke="transparent"
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]}
                  tick={{ fill: 'currentColor', fontSize: 10 }}
                  axisLine={false}
                  tickCount={5}
                  stroke="#444455"
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#6E59A5"
                  fill="#6E59A5"
                  fillOpacity={0.7}
                />
                <Radar
                  name="Previous"
                  dataKey="previous"
                  stroke="#0EA5E9"
                  fill="#0EA5E9"
                  fillOpacity={0.35}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ 
                    paddingTop: 20,
                    fontSize: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-accent/5 rounded-lg p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold">Mental Score</h4>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px]">
                      <p className="text-sm">
                        Your Mental Score is a weighted average of all trading metrics, 
                        providing a single number to gauge your trading psychology and performance.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-6">
                {mentalScore.toFixed(2)}
              </div>
              
              <div className="w-full bg-accent/20 rounded-full h-2.5 mb-1">
                <div 
                  className={`${getScoreColor(mentalScore)} h-2.5 rounded-full transition-all duration-700 ease-in-out`} 
                  style={{ width: `${mentalScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm md:text-base">What This Means For Your Trading</h4>
              <div className="space-y-3">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <h5 className="text-sm font-medium">Strength</h5>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{insights.strength}</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <h5 className="text-sm font-medium">Area for Improvement</h5>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{insights.improvement}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
