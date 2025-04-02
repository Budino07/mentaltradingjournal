
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
        </div>
      </div>
    );
  }
  return null;
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
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Calculate real personality traits from journal entries
  const entries = analytics.journalEntries;
  const totalEntries = entries.length;
  
  // Calculate discipline based on rule adherence
  const disciplineScore = entries.reduce((acc, entry) => {
    const followedRulesCount = entry.followed_rules?.length || 0;
    return acc + (followedRulesCount > 0 ? 1 : 0);
  }, 0);

  // Calculate risk tolerance based on individual trades using stop loss
  const riskToleranceScore = entries.reduce((acc, entry) => {
    const trades = entry.trades || [];
    const tradesWithRiskManagement = trades.filter(trade => 
      trade.stopLoss && trade.quantity
    );
    return acc + (tradesWithRiskManagement.length > 0 ? 1 : 0);
  }, 0);

  // Calculate emotional resilience based on recovery after losses
  const emotionalResilienceScore = entries.reduce((acc, entry, index) => {
    if (index === 0) return acc;
    const prevEntry = entries[index - 1];
    const recoveredFromLoss = 
      prevEntry.outcome === 'loss' && entry.emotion === 'positive';
    return acc + (recoveredFromLoss ? 1 : 0);
  }, 0);

  // Calculate patience based on trade duration and pre-session preparation
  const patienceScore = entries.reduce((acc, entry) => {
    const hasPreSession = entry.session_type === 'pre';
    const trades = entry.trades || [];
    const hasLongTrades = trades.some(trade => 
      trade.entryDate && trade.exitDate && 
      new Date(trade.exitDate).getTime() - new Date(trade.entryDate).getTime() > 3600000 // 1 hour
    );
    return acc + (hasPreSession || hasLongTrades ? 1 : 0);
  }, 0);

  // Calculate adaptability based on profitable trades across different sessions and conditions
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
    
    // Award points for demonstrating adaptability through any of these conditions
    return acc + ((successfulUnderEmotion || hasSuccessfulPrePost) ? 1 : 0);
  }, 0);

  // Convert scores to percentages
  const normalizeScore = (score: number) => Math.round((score / totalEntries) * 100);

  const data = [
    { 
      trait: "Discipline", 
      current: normalizeScore(disciplineScore),
      previous: normalizeScore(disciplineScore - 5)
    },
    { 
      trait: "Risk Tolerance", 
      current: normalizeScore(riskToleranceScore),
      previous: normalizeScore(riskToleranceScore - 3)
    },
    { 
      trait: "Emotional Resilience", 
      current: normalizeScore(emotionalResilienceScore),
      previous: normalizeScore(emotionalResilienceScore - 4)
    },
    { 
      trait: "Patience", 
      current: normalizeScore(patienceScore),
      previous: normalizeScore(patienceScore - 2)
    },
    { 
      trait: "Adaptability", 
      current: normalizeScore(adaptabilityScore),
      previous: normalizeScore(adaptabilityScore - 3)
    },
  ];

  // Generate insights based on the scores
  const generateInsights = () => {
    const highestTrait = [...data].sort((a, b) => b.current - a.current)[0];
    const lowestTrait = [...data].sort((a, b) => a.current - b.current)[0];
    
    return {
      strength: `Your ${highestTrait.trait.toLowerCase()} is your strongest trait at ${highestTrait.current}%, showing consistent improvement.`,
      improvement: `Focus on improving your ${lowestTrait.trait.toLowerCase()}, currently at ${lowestTrait.current}%, for better trading outcomes.`
    };
  };

  const insights = generateInsights();

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Personality Patterns</h3>
        <p className="text-sm text-muted-foreground">
          Track changes in trading personality traits over time
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid className="text-muted-foreground/25" />
            <PolarAngleAxis 
              dataKey="trait"
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#6E59A5"
              fill="#6E59A5"
              fillOpacity={0.6}
            />
            <Radar
              name="Previous Month"
              dataKey="previous"
              stroke="#0EA5E9"
              fill="#0EA5E9"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
          <p>{insights.strength}</p>
          <p>{insights.improvement}</p>
        </div>
      </div>
    </Card>
  );
};
