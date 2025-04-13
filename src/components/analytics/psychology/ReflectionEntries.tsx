
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatternAnalyzer } from './PatternAnalyzer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReflectionEntriesProps {
  emotionalData: any;
  onClose: () => void;
}

export const ReflectionEntries = ({ emotionalData, onClose }: ReflectionEntriesProps) => {
  if (!emotionalData) return null;
  
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

  const hasEmotionalData = emotionalData.preEmotion !== null || emotionalData.postEmotion !== null;

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
            </h3>
            
            <div className="space-y-3 mb-4">
              {emotionalData.preEmotion ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pre-Trading Emotional State</p>
                  <Badge variant={getEmotionBadgeColor(emotionalData.preEmotion, emotionalData.preScore)}>
                    {capitalizeEmotion(emotionalData.preEmotion)}
                  </Badge>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pre-Trading Emotional State</p>
                  <Badge variant="outline" className="text-muted-foreground">Not recorded</Badge>
                </div>
              )}
              
              {emotionalData.postEmotion ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Post-Trading Emotional State</p>
                  <Badge variant={getEmotionBadgeColor(emotionalData.postEmotion, emotionalData.postScore)}>
                    {capitalizeEmotion(emotionalData.postEmotion)}
                  </Badge>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Post-Trading Emotional State</p>
                  <Badge variant="outline" className="text-muted-foreground">Not recorded</Badge>
                </div>
              )}
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
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-red-700 dark:text-red-400">{emotionalData.patternType}</p>
                    {emotionalData.patternSource && (
                      <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                        Detection: {emotionalData.patternSource}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            {emotionalData.reflection ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Daily Reflection</h4>
                  <div className="bg-primary/5 border border-primary/10 rounded-md p-4 relative">
                    <div className="absolute -left-3 top-4 w-6 h-6 rotate-45 border-l border-b border-primary/10 bg-primary/5"></div>
                    <p className="text-sm leading-relaxed">{emotionalData.reflection}</p>
                    
                    {/* Apply pattern analyzer to all reflections */}
                    {emotionalData.reflection.length > 10 && (
                      <>
                        <PatternAnalyzer reflection={emotionalData.reflection} />
                        
                        <div className="mt-4 pt-3 border-t border-dashed border-primary/10">
                          <h5 className="text-sm font-medium mb-2 text-muted-foreground">Psychological Insights</h5>
                          <div className="flex flex-wrap gap-2">
                            {emotionalData.reflection.includes('fear') && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
                                Fear Reaction
                              </Badge>
                            )}
                            {emotionalData.reflection.includes('anxious') && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
                                Anxiety Response
                              </Badge>
                            )}
                            {emotionalData.reflection.includes('confident') && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                                Confidence State
                              </Badge>
                            )}
                            {emotionalData.reflection.includes('loss') && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                                Loss Processing
                              </Badge>
                            )}
                            {emotionalData.reflection.includes('learn') && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                Learning Mindset
                              </Badge>
                            )}
                            {(emotionalData.reflection.includes('greed') || emotionalData.reflection.includes('greedy')) && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                                Greed Response
                              </Badge>
                            )}
                            {(emotionalData.reflection.includes('frustrat') || emotionalData.reflection.includes('regret')) && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                                Frustration/Regret
                              </Badge>
                            )}
                            {(emotionalData.reflection.includes('slippage') || emotionalData.reflection.includes('gave back')) && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                                Giving Back Profits
                              </Badge>
                            )}
                          </div>
                        </div>
                      </>
                    )}
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
            
            {/* Data completeness warning */}
            {!hasEmotionalData && emotionalData.tradePnL !== 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          Limited emotional data for this trading day
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[260px]">
                      <p>This day has trading P&L data but no emotional records. Adding pre and post trading journal entries will provide deeper psychological insights.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
