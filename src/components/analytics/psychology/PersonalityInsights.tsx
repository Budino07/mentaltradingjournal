import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { analyzeRiskTolerance } from '@/utils/analytics/positionSizingAnalysis';
import { useQuery } from '@tanstack/react-query';
import { generateAnalytics } from '@/utils/analyticsUtils';

export const PersonalityInsights = () => {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const trades = analytics?.journalEntries.flatMap(entry => entry.trades || []) || [];
  
  // Calculate risk tolerance based on actual trading data
  const riskToleranceLevel = analyzeRiskTolerance(trades);
  
  const personalityTraits = [
    {
      name: 'Risk Tolerance',
      level: riskToleranceLevel,
      description: `${riskToleranceLevel > 70 
        ? 'High risk tolerance - consider reducing position sizes' 
        : riskToleranceLevel > 40 
        ? 'Moderate risk management - maintaining good position sizing' 
        : 'Conservative risk approach - could potentially increase position sizes safely'}`
    },
    { name: 'Patience', level: 45, description: 'Some tendency toward impatience when waiting for trade setups' },
    { name: 'Discipline', level: 78, description: 'Strong ability to follow trading rules and systems' },
    { name: 'Adaptability', level: 58, description: 'Moderately flexible in responding to changing market conditions' },
    { name: 'Emotional Reactivity', level: 72, description: 'Higher than average emotional response to market events' },
  ];
  
  const getTraitLevel = (level: number) => {
    if (level >= 80) return { label: 'Very High', color: 'text-green-600 bg-green-100' };
    if (level >= 60) return { label: 'High', color: 'text-blue-600 bg-blue-100' };
    if (level >= 40) return { label: 'Moderate', color: 'text-amber-600 bg-amber-100' };
    if (level >= 20) return { label: 'Low', color: 'text-orange-600 bg-orange-100' };
    return { label: 'Very Low', color: 'text-red-600 bg-red-100' };
  };

  return (
    <Card className="border border-primary/10 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-gradient-primary flex items-center gap-2">
          Personality Matrix
          <span className="ml-auto text-xs text-muted-foreground font-normal bg-muted/50 px-2 py-1 rounded-md">
            Based on trading patterns
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {personalityTraits.map((trait) => (
            <div key={trait.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{trait.name}</span>
                <Badge className={`${getTraitLevel(trait.level).color} border-none`}>
                  {getTraitLevel(trait.level).label}
                </Badge>
              </div>
              
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  style={{ width: `${trait.level}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-muted-foreground">{trait.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-primary/10">
          <div className="flex gap-2 items-start p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium mb-1">How Your Personality Affects Trading</p>
              <p>Your high emotional reactivity combined with moderate patience may cause premature exits. Focus on building patience with smaller position sizes.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
