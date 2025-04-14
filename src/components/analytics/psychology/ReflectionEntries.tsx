
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatternAnalyzer } from './PatternAnalyzer';
import { AlertTriangle } from 'lucide-react';

interface ReflectionEntriesProps {
  emotionalData: any;
  onClose: () => void;
}

export const ReflectionEntries = ({ emotionalData, onClose }: ReflectionEntriesProps) => {
  if (!emotionalData) return null;
  
  // Handle multiple reflections by joining them into a single consolidated text
  const multipleReflections = emotionalData.reflection ? emotionalData.reflection.split('\n\n') : [];
  const reflectionCount = multipleReflections.length;
  
  // Consolidate all reflections into a single reflection with proper spacing
  const consolidatedReflection = multipleReflections.join('\n\n');
  
  const getCoreNeedIcon = (need: string) => {
    switch (need) {
      case 'control': return '🎮';
      case 'validation': return '👍';
      case 'safety': return '🛡️';
      case 'connection': return '👥';
      case 'growth': return '🌱';
      default: return '❓';
    }
  };
  
  const getEmotionBadgeColor = (emotion: string | null, score: number | null) => {
    if (!emotion) return 'outline';
    
    const lowerEmotion = emotion.toLowerCase();
    
    if (['happy', 'confident', 'calm', 'focused', 'optimistic', 'positive'].includes(lowerEmotion)) {
      return 'variant-success'; // Green for positive emotions
    } else if (['neutral', 'content', 'reflective'].includes(lowerEmotion)) {
      return 'variant-neutral'; // Blue for neutral emotions
    } else if (['anxious', 'scared', 'frustrated', 'angry', 'sad', 'negative'].includes(lowerEmotion)) {
      return 'variant-warning'; // Purple/red for negative emotions
    }
    
    return 'outline'; // Default fallback
  };
  
  const capitalizeEmotion = (emotion: string | null) => {
    if (!emotion) return 'No data';
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  // Check if we have any emotional state data
  const hasEmotionalData = emotionalData.preEmotion || emotionalData.postEmotion;
  
  // Determine why a harmful pattern flag was set
  const getHarmfulPatternReason = () => {
    if (!emotionalData.hasHarmfulPattern) return null;
    
    if (emotionalData.patternType) {
      return emotionalData.patternType;
    }
    
    if (emotionalData.tradePnL < -100) {
      return 'Significant Loss';
    }
    
    return 'Pattern Detected';
  };

  return (
    <Card className="relative overflow-hidden border border-primary/15 bg-gradient-to-br from-background to-background/60 backdrop-blur-lg">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2" 
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium mb-2">
              {format(emotionalData.date, 'EEEE, MMMM d')}
              {reflectionCount > 1 && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Combined from {reflectionCount} entries)
                </span>
              )}
            </h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pre-Trading Emotional State</p>
                <Badge variant={getEmotionBadgeColor(emotionalData.preEmotion, emotionalData.preScore)}>
                  {capitalizeEmotion(emotionalData.preEmotion)}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Post-Trading Emotional State</p>
                <Badge variant={getEmotionBadgeColor(emotionalData.postEmotion, emotionalData.postScore)}>
                  {capitalizeEmotion(emotionalData.postEmotion)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center mt-4 gap-2">
              <div className="bg-primary/10 rounded-full p-2 h-10 w-10 flex items-center justify-center">
                <span className="text-lg">{getCoreNeedIcon(emotionalData.coreNeed)}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Core Need</p>
                <p className="font-medium capitalize">{emotionalData.coreNeed}</p>
              </div>
            </div>
            
            {emotionalData.hasHarmfulPattern && (
              <div className="mt-4 p-2 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-red-700 font-medium">Pattern Warning</p>
                  <p className="text-xs text-red-600">{getHarmfulPatternReason()}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            {consolidatedReflection ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      {reflectionCount > 1 ? 'Consolidated Daily Reflections' : 'Daily Reflection'}
                    </h4>
                    <div className="bg-primary/5 border border-primary/10 rounded-md p-4 relative">
                      <div className="absolute -left-3 top-4 w-6 h-6 rotate-45 border-l border-b border-primary/10 bg-primary/5"></div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{consolidatedReflection}</p>
                      
                      {consolidatedReflection.length > 10 && (
                        <>
                          <PatternAnalyzer reflection={consolidatedReflection} />
                          
                          <div className="mt-4 pt-3 border-t border-dashed border-primary/10">
                            <h5 className="text-sm font-medium mb-2 text-muted-foreground">Psychological Insights</h5>
                            <div className="flex flex-wrap gap-2">
                              {consolidatedReflection.includes('fear') && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Fear Reaction
                                </Badge>
                              )}
                              {consolidatedReflection.includes('anxious') && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Anxiety Response
                                </Badge>
                              )}
                              {consolidatedReflection.includes('confident') && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                  Confidence State
                                </Badge>
                              )}
                              {consolidatedReflection.includes('loss') && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                  Loss Processing
                                </Badge>
                              )}
                              {consolidatedReflection.includes('learn') && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  Learning Mindset
                                </Badge>
                              )}
                              {(consolidatedReflection.includes('greed') || consolidatedReflection.includes('greedy')) && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                  Greed Response
                                </Badge>
                              )}
                              {(consolidatedReflection.includes('frustrat') || consolidatedReflection.includes('regret')) && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                  Frustration/Regret
                                </Badge>
                              )}
                              {(consolidatedReflection.includes('slippage') || consolidatedReflection.includes('gave back')) && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                  Giving Back Profits
                                </Badge>
                              )}
                              {(consolidatedReflection.includes('recover') || consolidatedReflection.includes('fresh start') || 
                                 consolidatedReflection.includes('yesterday') || consolidatedReflection.includes('previous day')) && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                  Recency Bias
                                </Badge>
                              )}
                              {(consolidatedReflection.includes('feel good') || consolidatedReflection.includes('happy') || 
                                 consolidatedReflection.includes('positive') || consolidatedReflection.includes('optimistic')) && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                  Positive Mindset
                                </Badge>
                              )}
                              {emotionalData.hasHarmfulPattern && emotionalData.patternType && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                  {emotionalData.patternType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {emotionalData.tradePnL !== 0 && (
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full w-3 h-3 ${emotionalData.tradePnL > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-sm">
                      Trading P&L: <span className={`font-medium ${emotionalData.tradePnL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {emotionalData.tradePnL > 0 ? '+' : ''}{emotionalData.tradePnL.toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No reflection entries for this day.</p>
              </div>
            )}
            
            {!hasEmotionalData && emotionalData.hasHarmfulPattern && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h5 className="font-medium text-orange-700">Limited Emotional Data</h5>
                </div>
                <p className="text-sm text-orange-600">
                  This trading day shows potential pattern issues but has limited emotional data.
                  The warning is based primarily on trading performance and reflection content.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
