
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";

export const PersonalityInsights = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  // Calculate risk tolerance based on language in journal entries
  const calculateRiskTolerance = () => {
    if (!analytics || !analytics.journalEntries || analytics.journalEntries.length === 0) {
      return 50; // Default value if no data
    }
    
    const entries = analytics.journalEntries;
    let riskScore = 0;
    let totalEntries = 0;
    
    // Risk-related keywords and phrases
    const riskKeywords = [
      'high risk', 'higher risk', 'risky', 'aggressive', 'big position', 
      'large position', 'heavy position', 'bigger size', 'larger size',
      'increased size', 'risk more', 'risking more', 'double down',
      'went all in', 'max risk'
    ];
    
    // Conservative-related keywords and phrases
    const conservativeKeywords = [
      'low risk', 'lower risk', 'conservative', 'cautious', 'small position',
      'smaller size', 'reduced size', 'minimal risk', 'risk less',
      'scaled back', 'scaled down', 'risk averse', 'careful'
    ];
    
    entries.forEach(entry => {
      const notes = entry.notes ? entry.notes.toLowerCase() : '';
      
      // Check for risk keywords
      const hasRiskKeywords = riskKeywords.some(keyword => 
        notes.includes(keyword.toLowerCase())
      );
      
      // Check for conservative keywords
      const hasConservativeKeywords = conservativeKeywords.some(keyword => 
        notes.includes(keyword.toLowerCase())
      );
      
      if (hasRiskKeywords) {
        riskScore += 1;
      }
      
      if (hasConservativeKeywords) {
        riskScore -= 1; // Reduce score for conservative language
      }
      
      totalEntries += 1;
    });
    
    // Calculate percentage (50% is neutral, higher is more risk-tolerant)
    const baseScore = 50; // Neutral base
    const maxAdjustment = 40; // Maximum adjustment range
    const adjustmentFactor = totalEntries > 0 ? (riskScore / totalEntries) * maxAdjustment : 0;
    
    return Math.min(100, Math.max(10, Math.round(baseScore + adjustmentFactor)));
  };
  
  // Calculate discipline based on rule following and avoiding risky trades
  const calculateDiscipline = () => {
    if (!analytics || !analytics.journalEntries || analytics.journalEntries.length === 0) {
      return 50; // Default value if no data
    }
    
    const entries = analytics.journalEntries;
    let disciplineScore = 0;
    let totalEntries = 0;
    
    // Risk avoidance keywords and phrases that indicate discipline
    const riskAvoidanceKeywords = [
      'didn\'t take', 'didn\'t enter', 'avoided', 'skipped', 'passed on', 
      'stayed out', 'not worth', 'too risky', 'risk too high', 
      'didn\'t want to force', 'better to wait', 'patience',
      'walked away', 'looked risky', 'discipline', 'stuck to plan',
      'followed rules', 'no fomo', 'avoided fomo'
    ];
    
    // Contextual phrases that indicate avoiding trades due to risk (high discipline)
    const disciplineContextPhrases = [
      'didn\'t take this trade because',
      'skipped this one',
      'avoided because',
      'passing on this setup',
      'didn\'t want to force',
      'staying disciplined',
      'sticking to my rules',
      'not worth the risk',
      'better to miss',
      'no trade was better',
      'exercised restraint',
      'showing discipline',
      'waited for better',
      'resisted temptation',
      'avoided overtrading',
      'not rushing into',
      'let it go by'
    ];
    
    entries.forEach(entry => {
      const notes = entry.notes ? entry.notes.toLowerCase() : '';
      
      // Check for rule following
      const hasFollowedRules = entry.followed_rules && entry.followed_rules.length > 0;
      
      // Check for risk avoidance keywords
      let hasRiskAvoidance = false;
      
      // First check for contextual phrases that indicate discipline
      const hasDisciplineContext = disciplineContextPhrases.some(phrase => 
        notes.includes(phrase.toLowerCase())
      );
      
      // Then check for risk avoidance keywords nearby risk-related words
      if (!hasDisciplineContext) {
        const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        for (const sentence of sentences) {
          const lowerSentence = sentence.toLowerCase().trim();
          
          // Check if sentence contains risk avoidance keywords
          const containsAvoidance = riskAvoidanceKeywords.some(keyword => 
            lowerSentence.includes(keyword.toLowerCase())
          );
          
          // Check if sentence also mentions risk or similar concepts
          const riskMentioned = lowerSentence.includes('risk') || 
                               lowerSentence.includes('volatil') || 
                               lowerSentence.includes('aggressive') ||
                               lowerSentence.includes('uncertain');
          
          if (containsAvoidance && riskMentioned) {
            hasRiskAvoidance = true;
            break;
          }
        }
      }
      
      // Award points for discipline indicators
      if (hasFollowedRules) {
        disciplineScore += 1;
      }
      
      if (hasDisciplineContext || hasRiskAvoidance) {
        disciplineScore += 1;
      }
      
      totalEntries += 1;
    });
    
    // Calculate percentage with a base value
    const baseScore = 40; // Base discipline score
    const maxAdjustment = 60; // Maximum adjustment range
    // A trader could show discipline in multiple ways per entry, so normalize by total entries
    const adjustmentFactor = totalEntries > 0 ? (disciplineScore / totalEntries) * maxAdjustment : 0;
    
    return Math.min(100, Math.max(10, Math.round(baseScore + adjustmentFactor)));
  };
  
  // Calculate emotional reactivity based on emotion changes and response to losses
  const calculateEmotionalReactivity = () => {
    if (!analytics || !analytics.journalEntries || analytics.journalEntries.length === 0) {
      return 50; // Default value if no data
    }
    
    const entries = analytics.journalEntries;
    let reactivityScore = 0;
    let totalFactors = 0;
    
    // Sort entries by date for temporal analysis
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // 1. Analyze emotional state changes between pre/post sessions
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentEntry = sortedEntries[i];
      const nextEntry = sortedEntries[i + 1];
      
      // Check if we have a pre-session followed by post-session
      if (currentEntry.session_type === 'pre' && nextEntry.session_type === 'post') {
        // Check for negative emotional shift (indicates reactivity)
        if (
          (currentEntry.emotion === 'positive' && nextEntry.emotion === 'negative') ||
          (currentEntry.emotion === 'neutral' && nextEntry.emotion === 'negative')
        ) {
          reactivityScore += 1;
          totalFactors += 1;
        }
        
        // Check for stable or improved emotional state (indicates lower reactivity)
        if (
          (currentEntry.emotion === currentEntry.emotion) ||
          (currentEntry.emotion === 'negative' && nextEntry.emotion === 'neutral') ||
          (currentEntry.emotion === 'negative' && nextEntry.emotion === 'positive') ||
          (currentEntry.emotion === 'neutral' && nextEntry.emotion === 'positive')
        ) {
          totalFactors += 1;
        }
      }
    }
    
    // 2. Check for negative language patterns in post-session entries after losses
    const lossEntries = sortedEntries.filter(entry => 
      entry.session_type === 'post' && entry.outcome === 'loss'
    );
    
    // Emotional reactivity phrases to look for in post-loss entries
    const reactivityPhrases = [
      'frustrated', 'angry', 'annoyed', 'upset', 'mad',
      'revenge trade', 'revenge trading', 'getting back', 'make it back',
      'couldn\'t accept', 'couldn\'t handle', 'emotional decision',
      'traded angry', 'traded emotionally', 'lost control',
      'overreacted', 'need to recover', 'tilted', 'on tilt'
    ];
    
    lossEntries.forEach(entry => {
      if (!entry.notes) return;
      
      const notes = entry.notes.toLowerCase();
      const hasReactivityPhrases = reactivityPhrases.some(phrase => 
        notes.includes(phrase.toLowerCase())
      );
      
      if (hasReactivityPhrases) {
        reactivityScore += 1;
      }
      
      totalFactors += 1;
    });
    
    // 3. Check for quick trading after losses (less than 10 minutes)
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentEntry = sortedEntries[i];
      const nextEntry = sortedEntries[i + 1];
      
      // Skip entries without trades
      if (!currentEntry.trades || !nextEntry.trades) continue;
      if (currentEntry.trades.length === 0 || nextEntry.trades.length === 0) continue;
      
      // Check if current entry has a losing trade
      const hasLosingTrade = currentEntry.trades.some(trade => 
        Number(trade.pnl) < 0 || (trade.profit_loss && Number(trade.profit_loss) < 0)
      );
      
      if (hasLosingTrade) {
        // Find last trade exit time from current entry
        const lastTradeExit = currentEntry.trades
          .filter(trade => trade.exitDate)
          .map(trade => new Date(trade.exitDate as string).getTime())
          .sort((a, b) => b - a)[0]; // Get most recent exit time
        
        // Find first trade entry time from next entry
        const firstTradeEntry = nextEntry.trades
          .filter(trade => trade.entryDate)
          .map(trade => new Date(trade.entryDate as string).getTime())
          .sort((a, b) => a - b)[0]; // Get earliest entry time
        
        if (lastTradeExit && firstTradeEntry) {
          // Calculate time difference in minutes
          const timeDiffMinutes = (firstTradeEntry - lastTradeExit) / (1000 * 60);
          
          // If trader entered new trade within 10 minutes after a loss
          if (timeDiffMinutes < 10) {
            reactivityScore += 1;
          }
          
          totalFactors += 1;
        }
      }
    }
    
    // Calculate score - higher score means more emotional reactivity
    const baseScore = 50; // Neutral base
    const maxAdjustment = 40;
    const adjustmentFactor = totalFactors > 0 ? (reactivityScore / totalFactors) * maxAdjustment : 0;
    
    return Math.min(100, Math.max(10, Math.round(baseScore + adjustmentFactor)));
  };
  
  if (isLoading) {
    return (
      <Card className="border border-primary/10 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-gradient-primary">
            Personality Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate trait values
  const riskTolerance = calculateRiskTolerance();
  const discipline = calculateDiscipline();
  const emotionalReactivity = calculateEmotionalReactivity();
  
  // Define personality traits with dynamic values
  const personalityTraits = [
    { 
      name: 'Risk Tolerance', 
      level: riskTolerance, 
      description: 'Level of comfort with risk taking based on language used in journal entries' 
    },
    { 
      name: 'Discipline', 
      level: discipline, 
      description: 'Ability to follow trading rules and avoid high-risk situations when appropriate' 
    },
    { 
      name: 'Emotional Reactivity', 
      level: emotionalReactivity, 
      description: 'Response to market events, particularly losses, and emotional stability between sessions' 
    },
  ];
  
  const getTraitLevel = (level: number) => {
    if (level >= 80) return { label: 'Very High', color: 'text-green-600 bg-green-100' };
    if (level >= 60) return { label: 'High', color: 'text-blue-600 bg-blue-100' };
    if (level >= 40) return { label: 'Moderate', color: 'text-amber-600 bg-amber-100' };
    if (level >= 20) return { label: 'Low', color: 'text-orange-600 bg-orange-100' };
    return { label: 'Very Low', color: 'text-red-600 bg-red-100' };
  };

  // Generate personalized insight based on discipline and risk tolerance
  const generatePersonalizedInsight = () => {
    if (riskTolerance > 70 && discipline < 50) {
      return "Your high risk tolerance combined with lower discipline suggests you may take risks without adequate safeguards. Focus on developing stronger discipline and rules.";
    } else if (riskTolerance > 70 && discipline > 70) {
      return "You balance a high risk appetite with strong discipline, allowing for calculated risk-taking while maintaining control.";
    } else if (riskTolerance < 30 && discipline > 70) {
      return "Your cautious approach and high discipline may lead to conservative but consistent results. Consider if slightly higher risk could improve returns.";
    } else if (riskTolerance < 30 && discipline < 50) {
      return "While you're risk-averse, your lower discipline scores suggest inconsistent execution. Work on developing stronger trading routines.";
    } else if (emotionalReactivity > 70) {
      return "Your higher emotional reactivity may be affecting trading decisions. Consider implementing cool-down periods after losses.";
    } else if (emotionalReactivity < 30 && discipline > 60) {
      return "Your emotional stability and discipline are strengths. This combination typically leads to more consistent trading results.";
    } else {
      return "Your balanced profile shows moderate risk management and discipline. Focus on building consistency with your approach.";
    }
  };

  const personalizedInsight = generatePersonalizedInsight();

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
              <p>{personalizedInsight}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

