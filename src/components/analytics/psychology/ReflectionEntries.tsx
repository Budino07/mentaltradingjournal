
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatternAnalyzer } from './PatternAnalyzer';
import { AlertTriangle } from 'lucide-react';
import { CoreTrait } from '@/utils/psychology/coreNeedsAnalysis';
import { useQuery } from '@tanstack/react-query';
import { generateAnalytics } from '@/utils/analyticsUtils';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import { Trade } from '@/types/trade';

interface ReflectionEntriesProps {
  emotionalData: any;
  onClose: () => void;
}

export const ReflectionEntries = ({ emotionalData, onClose }: ReflectionEntriesProps) => {
  if (!emotionalData) return null;
  
  // Fetch analytics data to get associated trade details
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  // Find the trades that correspond to this reflection date
  const associatedTrades = React.useMemo(() => {
    if (!analyticsData?.journalEntries) return [];
    
    // Filter journal entries by date
    const entriesForDate = analyticsData.journalEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const emotionalDate = emotionalData.date;
      return entryDate.toDateString() === emotionalDate.toDateString();
    });
    
    // Extract trades from those entries
    return entriesForDate.flatMap(entry => entry.trades || []);
  }, [analyticsData?.journalEntries, emotionalData?.date]);
  
  // Process reflections to exclude trade-specific notes
  const processReflections = () => {
    if (!emotionalData.reflection) return "";
    
    const reflections = emotionalData.reflection.split('\n\n');
    
    // Filter out reflections that are likely trade-specific
    // These typically contain specific details about trade entries, PnL, etc.
    const generalReflections = reflections.filter(reflection => {
      const lowerReflection = reflection.toLowerCase();
      return !lowerReflection.includes('trade entry') && 
             !lowerReflection.includes('pnl') && 
             !lowerReflection.includes('position') &&
             !lowerReflection.includes('setup') &&
             !lowerReflection.includes('entry price');
    });
    
    return generalReflections.join('\n\n');
  };
  
  // Get consolidated daily reflection without trade-specific notes
  const consolidatedReflection = processReflections();
  const reflectionCount = emotionalData.reflection ? emotionalData.reflection.split('\n\n').length : 0;
  const generalReflectionCount = consolidatedReflection.split('\n\n').length;
  
  const getCoreTraitIcon = (trait: CoreTrait) => {
    switch (trait) {
      case 'control': return '🧠';
      case 'validation': return '👍';
      case 'safety': return '🛡️';
      case 'connection': return '👥';
      case 'growth': return '🌱';
      case 'conviction': return '🎯';
      case 'focus': return '🔍';
      case 'confidence': return '💪';
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

  const openImageInNewTab = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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

  // Analyze text for sentiment keywords
  const getSentimentBadges = (text: string) => {
    const badges = [];
    
    if (!text) return badges;
    
    const textLower = text.toLowerCase();
    
    if (textLower.includes('fear')) badges.push('Fear Reaction');
    if (textLower.includes('anxious')) badges.push('Anxiety Response');
    if (textLower.includes('confident')) badges.push('Confidence State');
    if (textLower.includes('loss')) badges.push('Loss Processing');
    if (textLower.includes('learn')) badges.push('Learning Mindset');
    if (textLower.includes('greed') || textLower.includes('greedy')) badges.push('Greed Response');
    if (textLower.includes('frustrat') || textLower.includes('regret')) badges.push('Frustration/Regret');
    if (textLower.includes('slippage') || textLower.includes('gave back')) badges.push('Giving Back Profits');
    if (textLower.includes('recover') || textLower.includes('fresh start') || 
        textLower.includes('yesterday') || textLower.includes('previous day')) badges.push('Recency Bias');
    if (textLower.includes('feel good') || textLower.includes('happy') || 
        textLower.includes('positive') || textLower.includes('optimistic')) badges.push('Positive Mindset');
    
    return badges;
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
                  Daily Overview
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
                <span className="text-lg">{getCoreTraitIcon(emotionalData.coreTrait)}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Core Trait</p>
                <p className="font-medium capitalize">{emotionalData.coreTrait}</p>
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
                      {reflectionCount > 1 ? 'Daily Overview' : 'Daily Reflection'}
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
                              {getSentimentBadges(consolidatedReflection).map((badge, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`
                                    ${badge.includes('Fear') || badge.includes('Anxiety') || badge.includes('Loss') || 
                                      badge.includes('Greed') || badge.includes('Frustration') || badge.includes('Back')
                                      ? 'bg-red-100 text-red-800 border-red-300' 
                                      : badge.includes('Confidence') || badge.includes('Learning') || badge.includes('Positive')
                                      ? 'bg-green-100 text-green-800 border-green-300'
                                      : 'bg-blue-100 text-blue-800 border-blue-300'
                                    }
                                  `}
                                >
                                  {badge}
                                </Badge>
                              ))}
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
        
        {/* Associated trades section with trade notes */}
        {associatedTrades && associatedTrades.length > 0 && (
          <div className="mt-8">
            <Separator className="mb-6" />
            
            <h4 className="text-lg font-medium mb-4">Associated Trades</h4>
            
            <div className="space-y-6">
              {associatedTrades.map((trade: Trade, index: number) => (
                <div key={trade.id || index} className="border border-primary/15 rounded-lg p-4 bg-background/40 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="md:w-1/2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className={`h-3 w-3 rounded-full ${
                          trade.pnl && Number(trade.pnl) > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <h5 className="font-medium">{trade.instrument || 'Unknown Instrument'}</h5>
                        <Badge variant={trade.direction === 'buy' ? 'variant-success' : 'destructive'}>
                          {trade.direction === 'buy' ? 'Long' : 'Short'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p>{trade.entryPrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Exit Price</p>
                          <p>{trade.exitPrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P/L</p>
                          <p className={`font-medium ${
                            trade.pnl && Number(trade.pnl) > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {trade.pnl ? (Number(trade.pnl) > 0 ? '+' : '') + trade.pnl : 'N/A'}
                          </p>
                        </div>
                        {trade.setup && (
                          <div>
                            <p className="text-muted-foreground">Setup</p>
                            <p>{trade.setup}</p>
                          </div>
                        )}
                        {trade.stopLoss && (
                          <div>
                            <p className="text-muted-foreground">Stop Loss</p>
                            <p>{trade.stopLoss}</p>
                          </div>
                        )}
                        {trade.takeProfit && (
                          <div>
                            <p className="text-muted-foreground">Take Profit</p>
                            <p>{trade.takeProfit}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Trade notes section */}
                    {trade.notes && (
                      <div className="md:w-1/2 bg-primary/5 border border-primary/10 rounded-md p-4 relative">
                        <p className="text-sm leading-relaxed">{trade.notes}</p>
                        
                        {/* Display sentiment badges for trade notes */}
                        {trade.notes && trade.notes.length > 10 && (
                          <div className="mt-3 pt-3 border-t border-dashed border-primary/10">
                            <div className="flex flex-wrap gap-2">
                              {getSentimentBadges(trade.notes).map((badge, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`
                                    ${badge.includes('Fear') || badge.includes('Anxiety') || badge.includes('Loss') || 
                                      badge.includes('Greed') || badge.includes('Frustration') || badge.includes('Back')
                                      ? 'bg-red-100 text-red-800 border-red-300' 
                                      : badge.includes('Confidence') || badge.includes('Learning') || badge.includes('Positive')
                                      ? 'bg-green-100 text-green-800 border-green-300'
                                      : 'bg-blue-100 text-blue-800 border-blue-300'
                                    }
                                  `}
                                >
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Trade screenshots */}
                  {(trade.forecastScreenshot || trade.resultScreenshot) && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <h6 className="text-sm font-medium mb-2">Trade Screenshots</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trade.forecastScreenshot && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium flex items-center gap-1">
                              Forecast
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </p>
                            <div 
                              onClick={() => openImageInNewTab(trade.forecastScreenshot)} 
                              className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                            >
                              <img 
                                src={trade.forecastScreenshot} 
                                alt="Trade forecast" 
                                className="rounded-md border border-border max-h-40 object-contain w-full" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <ExternalLink className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {trade.resultScreenshot && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium flex items-center gap-1">
                              Result
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </p>
                            <div 
                              onClick={() => openImageInNewTab(trade.resultScreenshot)} 
                              className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                            >
                              <img 
                                src={trade.resultScreenshot} 
                                alt="Trade result" 
                                className="rounded-md border border-border max-h-40 object-contain w-full" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <ExternalLink className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
