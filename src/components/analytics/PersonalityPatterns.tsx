
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
          <h3 className="text-xl md:text-2xl font-bold">Personality Patterns</h3>
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

  // Convert raw scores to percentages based on total entries
  const normalizeScore = (score: number) => Math.round((score / totalEntries) * 100);

  // Create data array for the radar chart
  const data = [
    { 
      trait: "Discipline", 
      current: normalizeScore(disciplineScore),
      previous: normalizeScore(disciplineScore - 5),
      description: "Measures how consistently you follow your trading rules and document them."
    },
    { 
      trait: "Risk Management", 
      current: normalizeScore(riskManagementScore),
      previous: normalizeScore(riskManagementScore - 3),
      description: "Shows how effectively you use stop losses and position sizing in your trades."
    },
    { 
      trait: "Emotional Resilience", 
      current: normalizeScore(emotionalResilienceScore),
      previous: normalizeScore(emotionalResilienceScore - 4),
      description: "Reflects your ability to maintain a positive mindset after losses."
    },
    { 
      trait: "Patience", 
      current: normalizeScore(patienceScore),
      previous: normalizeScore(patienceScore - 2),
      description: "Indicates your ability to wait for high-quality setups and hold trades for optimal results."
    },
    { 
      trait: "Adaptability", 
      current: normalizeScore(adaptabilityScore),
      previous: normalizeScore(adaptabilityScore - 3),
      description: "Shows how well you adjust to different market conditions and emotional states."
    },
    { 
      trait: "Focus", 
      current: normalizeScore(focusScore),
      previous: normalizeScore(focusScore - 3),
      description: "Measures your attention to detail through note-taking and mistake avoidance."
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
    <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Trading Personality Profile</h3>
          <p className="text-sm text-muted-foreground">
            Key personality traits based on your trading journal
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
                This chart analyzes your journal entries to identify your key trading personality traits.
                Higher percentages indicate stronger traits.
                Hover over each trait for more details.
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

      <div className="space-y-3">
        <h4 className="font-semibold text-sm md:text-base">What This Means For Your Trading</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </Card>
  );
};

