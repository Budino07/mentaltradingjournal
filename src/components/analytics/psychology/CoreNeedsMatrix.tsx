import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CoreNeedsMatrixProps {
  emotionalData: any[];
}

interface NeedDataItem {
  name: string;
  value: number;
}

export const CoreNeedsMatrix = ({ emotionalData }: CoreNeedsMatrixProps) => {
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  
  const needsData = React.useMemo(() => {
    const coreNeeds = emotionalData.reduce((acc: Record<string, number>, item) => {
      if (!acc[item.coreNeed]) {
        acc[item.coreNeed] = 0;
      }
      acc[item.coreNeed]++;
      return acc;
    }, {});
    
    return Object.entries(coreNeeds).map(([name, value]) => ({
      name,
      value,
    }));
  }, [emotionalData]);
  
  const colors = {
    control: '#9333ea',
    validation: '#dc2626',
    safety: '#16a34a',
    connection: '#0284c7',
    growth: '#ca8a04',
    unknown: '#6b7280',
  };

  const needDescriptions = {
    control: 'Desire to feel in charge of one\'s trading decisions and outcomes. May manifest as overtrading to regain control after losses.',
    validation: 'Seeking confirmation of self-worth through trading success. May lead to excessive risk-taking for big wins.',
    safety: 'Prioritizing security and risk management. May result in exiting trades too early out of fear.',
    connection: 'Seeking belonging in trading communities. May lead to following others\' strategies without proper analysis.',
    growth: 'Focus on learning and improvement. May result in overthinking or analysis paralysis.',
    unknown: 'Psychological needs that haven\'t been clearly identified yet in your journal entries.'
  };
  
  const needRecommendations = {
    control: 'Practice letting go with small positions. Use strict stop-losses to accept what you cannot control.',
    validation: 'Separate trading results from self-worth. Seek validation through process adherence, not just outcomes.',
    safety: 'Balance caution with opportunity. Set defined risk parameters but allow winning trades to run.',
    connection: 'Build authentic trading relationships but maintain independent thinking. Validate others\' ideas with your own analysis.',
    growth: 'Implement new learnings gradually. Set specific learning goals separate from profit targets.',
    unknown: 'Journal more deeply about emotional reactions to uncover underlying psychological needs.'
  };
  
  const getCoreNeedIcon = (need: string) => {
    switch (need) {
      case 'control': return '🧠';
      case 'validation': return '👍';
      case 'safety': return '🛡️';
      case 'connection': return '👥';
      case 'growth': return '🌱';
      default: return '❓';
    }
  };
  
  const handleNeedClick = (need: string) => {
    setSelectedNeed(selectedNeed === need ? null : need);
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
    // Return 0 if there's no emotional data to prevent division by zero
    if (!emotionalData.length) return 0;
    return Math.round((value / emotionalData.length) * 100);
  };

  return (
    <Card className="border border-primary/10 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-gradient-primary">Core Needs Matrix</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={needsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={90}
                  paddingAngle={1}
                  dataKey="value"
                  onClick={(data) => handleNeedClick(data.name)}
                >
                  {needsData.map((entry: NeedDataItem, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[entry.name as keyof typeof colors] || '#6b7280'} 
                      stroke="none"
                      opacity={selectedNeed === null || selectedNeed === entry.name ? 1 : 0.5}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <div className="space-y-3">
              {needsData.map((need: NeedDataItem) => (
                <div 
                  key={need.name}
                  className={`p-2 rounded-md transition-all cursor-pointer
                    ${selectedNeed === need.name ? 'bg-primary/10 border border-primary/20' : 'hover:bg-primary/5'}`}
                  onClick={() => handleNeedClick(need.name)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-6 h-6 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: colors[need.name as keyof typeof colors] || '#6b7280' }}
                    >
                      <span>{getCoreNeedIcon(need.name)}</span>
                    </div>
                    <h3 className="font-medium capitalize">{need.name}</h3>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {calculatePercentage(need.value)}%
                    </Badge>
                  </div>
                  
                  {selectedNeed === need.name && (
                    <div className="pt-2 mt-2 border-t border-primary/10 text-sm animate-fade-in">
                      <p className="text-muted-foreground mb-2">
                        {needDescriptions[need.name as keyof typeof needDescriptions]}
                      </p>
                      <div className="bg-primary/5 p-2 rounded text-xs">
                        <strong>Recommendation:</strong> {needRecommendations[need.name as keyof typeof needRecommendations]}
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
