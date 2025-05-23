
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { generateAnalytics } from '@/utils/analyticsUtils';
import { 
  CoreTrait, 
  generateEmotionalData, 
  analyzeJournalEntriesForCoreTraits 
} from '@/utils/psychology/coreNeedsAnalysis';
import { cn } from '@/lib/utils';
import { 
  Brain, Shield, ThumbsUp, Users, Sprout, 
  Target, Focus, Rocket 
} from 'lucide-react';

interface CoreTraitsMatrixProps {
  emotionalData?: any[];
}

interface TraitDataItem {
  name: string;
  value: number;
}

export const CoreTraitsMatrix = ({ emotionalData: providedData }: CoreTraitsMatrixProps) => {
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  const traitsData = React.useMemo(() => {
    if (providedData && providedData.length > 0) {
      // If data is provided externally, use it
      const coreTraits = providedData.reduce((acc: Record<string, number>, item) => {
        const traitName = item.coreTrait || 'unknown';
        // Skip unknown traits
        if (traitName !== 'unknown') {
          if (!acc[traitName]) {
            acc[traitName] = 0;
          }
          acc[traitName]++;
        }
        return acc;
      }, {});
      
      return Object.entries(coreTraits).map(([name, value]) => ({
        name,
        value,
      }));
    } else if (analyticsData?.journalEntries) {
      // Otherwise analyze journal entries using our utility
      const analyzedTraits = analyzeJournalEntriesForCoreTraits(analyticsData.journalEntries);
      
      // Filter out the unknown trait
      return analyzedTraits
        .filter(({ coreTrait }) => coreTrait !== 'unknown')
        .map(({ coreTrait, count }) => ({
          name: coreTrait,
          value: count,
        }));
    }
    
    return [];
  }, [providedData, analyticsData]);
  
  // Enhanced gradient color palette for premium look
  const colors = {
    control: 'url(#controlGradient)',
    validation: 'url(#validationGradient)',
    safety: 'url(#safetyGradient)',
    connection: 'url(#connectionGradient)',
    growth: 'url(#growthGradient)',
    conviction: 'url(#convictionGradient)',
    focus: 'url(#focusGradient)',
    confidence: 'url(#confidenceGradient)',
    unknown: 'url(#unknownGradient)',
  };
  
  // Solid colors for icons and borders
  const solidColors = {
    control: '#9333ea',
    validation: '#dc2626',
    safety: '#16a34a',
    connection: '#0284c7',
    growth: '#ca8a04',
    conviction: '#e11d48',
    focus: '#0891b2',
    confidence: '#7c3aed',
    unknown: '#6b7280',
  };

  const traitDescriptions = {
    control: 'Desire to feel in charge of one\'s trading decisions and outcomes. May manifest as overtrading to regain control after losses.',
    validation: 'Seeking confirmation of self-worth through trading success. May lead to excessive risk-taking for big wins.',
    safety: 'Prioritizing security and risk management. May result in exiting trades too early out of fear.',
    connection: 'Seeking belonging in trading communities. May lead to following others\' strategies without proper analysis.',
    growth: 'Focus on learning and improvement. May result in overthinking or analysis paralysis.',
    conviction: 'Strong belief in a setup or decision — reflected in holding through volatility and executing without hesitation.',
    focus: 'Staying present, mentally engaged, and undistracted during the trading process.',
    confidence: 'Belief in oneself — executing with clarity and maintaining emotional strength regardless of the outcome.',
    unknown: 'Psychological traits that haven\'t been clearly identified yet in your journal entries.'
  };
  
  const traitRecommendations = {
    control: 'Practice letting go with small positions. Use strict stop-losses to accept what you cannot control.',
    validation: 'Separate trading results from self-worth. Seek validation through process adherence, not just outcomes.',
    safety: 'Balance caution with opportunity. Set defined risk parameters but allow winning trades to run.',
    connection: 'Build authentic trading relationships but maintain independent thinking. Validate others\' ideas with your own analysis.',
    growth: 'Implement new learnings gradually. Set specific learning goals separate from profit targets.',
    conviction: 'Build conviction through thorough research and testing. Practice holding positions when your analysis remains valid.',
    focus: 'Create a distraction-free trading environment. Practice mindfulness exercises before trading sessions.',
    confidence: 'Track all successful trades to build evidence for your abilities. Challenge negative self-talk with factual data.',
    unknown: 'Journal more deeply about emotional reactions to uncover underlying psychological traits.'
  };
  
  // Enhanced trait icons using Lucide React
  const getTraitIcon = (trait: string) => {
    switch (trait) {
      case 'control': 
        return <Brain className="stroke-white" size={18} />;
      case 'validation': 
        return <ThumbsUp className="stroke-white" size={18} />;
      case 'safety': 
        return <Shield className="stroke-white" size={18} />;
      case 'connection': 
        return <Users className="stroke-white" size={18} />;
      case 'growth': 
        return <Sprout className="stroke-white" size={18} />;
      case 'conviction': 
        return <Target className="stroke-white" size={18} />;
      case 'focus': 
        return <Focus className="stroke-white" size={18} />;
      case 'confidence': 
        return <Rocket className="stroke-white" size={18} />;
      default: 
        return <Brain className="stroke-white" size={18} />;
    }
  };
  
  const handleTraitClick = (trait: string) => {
    setSelectedTrait(selectedTrait === trait ? null : trait);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border p-2 rounded shadow-md text-xs">
          <p className="capitalize font-medium">{payload[0].name}</p>
          <p>Frequency: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate percentages safely with type checking
  const calculatePercentage = (value: number): number => {
    // Get total value
    const total = traitsData.reduce((sum, item) => sum + (item.value as number), 0);
    // Return 0 if there's no data to prevent division by zero
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // If there's no data, show a placeholder
  if (!traitsData.length) {
    return (
      <Card className="border border-primary/10 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-md overflow-hidden shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-gradient-primary">Core Traits Matrix</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="text-4xl mb-4 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">🧠</div>
            <h3 className="text-lg font-medium mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">No data available yet</h3>
            <p className="text-sm text-muted-foreground">
              Start journaling about your trading emotions to see your psychological traits analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-primary/10 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-md overflow-hidden shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text">
          Core Traits Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <defs>
                  {/* Define gradients for each trait */}
                  <linearGradient id="controlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7e22ce" />
                  </linearGradient>
                  <linearGradient id="validationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient id="safetyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                  <linearGradient id="connectionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                  <linearGradient id="convictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0e7490" />
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6d28d9" />
                  </linearGradient>
                  <linearGradient id="unknownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#4b5563" />
                  </linearGradient>
                </defs>
                <Pie
                  data={traitsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={90}
                  paddingAngle={1}
                  dataKey="value"
                  onClick={(data) => handleTraitClick(data.name)}
                >
                  {traitsData.map((entry: TraitDataItem, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[entry.name as keyof typeof colors] || colors.unknown} 
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                      opacity={selectedTrait === null || selectedTrait === entry.name ? 1 : 0.5}
                      className="drop-shadow-md transition-opacity duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <div className="space-y-3">
              {traitsData.map((trait: TraitDataItem) => (
                <div 
                  key={trait.name}
                  className={cn(
                    "p-2 rounded-md transition-all cursor-pointer",
                    selectedTrait === trait.name 
                      ? "bg-gradient-to-r from-background/80 to-background/50 border border-primary/20 shadow-sm" 
                      : "hover:bg-primary/5"
                  )}
                  onClick={() => handleTraitClick(trait.name)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-8 h-8 flex items-center justify-center rounded-full shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${solidColors[trait.name as keyof typeof solidColors]} 0%, ${solidColors[trait.name as keyof typeof solidColors]}99 100%)` 
                      }}
                    >
                      {getTraitIcon(trait.name)}
                    </div>
                    <h3 className="font-medium capitalize">{trait.name}</h3>
                    <Badge variant="outline" className="ml-auto text-xs bg-background/80 backdrop-blur-sm">
                      {calculatePercentage(trait.value)}%
                    </Badge>
                  </div>
                  
                  {selectedTrait === trait.name && (
                    <div className="pt-2 mt-2 border-t border-primary/10 text-sm animate-fade-in">
                      <p className="text-muted-foreground mb-2">
                        {traitDescriptions[trait.name as keyof typeof traitDescriptions]}
                      </p>
                      <div className="bg-gradient-to-r from-primary/5 to-background p-3 rounded text-xs">
                        <strong>Recommendation:</strong> {traitRecommendations[trait.name as keyof typeof traitRecommendations]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
