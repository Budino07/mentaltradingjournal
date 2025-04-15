
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
      
      // Compare year, month, and day separately to avoid timezone issues
      return entryDate.getFullYear() === emotionalDate.getFullYear() &&
             entryDate.getMonth() === emotionalDate.getMonth() &&
             entryDate.getDate() === emotionalDate.getDate();
    });
    
    // Extract trades from those entries
    return entriesForDate.flatMap(entry => entry.trades || []);
  }, [analyticsData?.journalEntries, emotionalData?.date]);
  
  // Find and categorize journal entries by session type
  const journalEntries = React.useMemo(() => {
    if (!analyticsData?.journalEntries) return { preSessions: [], postSessions: [], trades: [] };
    
    // Filter journal entries by date
    const entriesForDate = analyticsData.journalEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const emotionalDate = emotionalData.date;
      
      // Compare year, month, and day separately to avoid timezone issues
      return entryDate.getFullYear() === emotionalDate.getFullYear() &&
             entryDate.getMonth() === emotionalDate.getMonth() &&
             entryDate.getDate() === emotionalDate.getDate();
    });
    
    return {
      preSessions: entriesForDate.filter(entry => entry.session_type === 'pre'),
      postSessions: entriesForDate.filter(entry => entry.session_type === 'post'),
      trades: entriesForDate.filter(entry => entry.session_type === 'trade')
    };
  }, [analyticsData?.journalEntries, emotionalData?.date]);
  
  // Consolidate reflections by type
  const preSessionReflections = journalEntries.preSessions.map(entry => entry.notes).filter(Boolean).join('\n\n');
  const postSessionReflections = journalEntries.postSessions.map(entry => entry.notes).filter(Boolean).join('\n\n');
  const tradeReflections = journalEntries.trades.map(entry => entry.notes).filter(Boolean).join('\n\n');
  
  // Handle multiple reflections by joining them into a single consolidated text
  const allReflections = [preSessionReflections, tradeReflections, postSessionReflections].filter(Boolean);
  const reflectionCount = allReflections.length;
  
  // Consolidate all reflections into a single reflection with proper spacing
  const consolidatedReflection = allReflections.join('\n\n');
  
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
                      {reflectionCount > 1 ? 'Daily Reflections' : 'Daily Reflection'}
                    </h4>
                    
                    {/* Pre-Session Reflections */}
                    {preSessionReflections && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <h5 className="text-sm font-medium text-blue-700">Pre-Session Reflection</h5>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-md p-4 relative">
                          <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{preSessionReflections}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Trade Reflections */}
                    {tradeReflections && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                          <h5 className="text-sm font-medium text-purple-700">Trading Notes</h5>
                        </div>
                        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-md p-4 relative">
                          <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{tradeReflections}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Post-Session Reflections */}
                    {postSessionReflections && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <h5 className="text-sm font-medium text-green-700">Post-Session Reflection</h5>
                        </div>
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-md p-4 relative">
                          <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{postSessionReflections}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Pattern Analysis */}
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
        
        {/* Associated Trades section */}
        {associatedTrades && associatedTrades.length > 0 && (
          <div className="mt-8">
            <Separator className="mb-6" />
            
            <h4 className="text-lg font-medium mb-4">Associated Trades</h4>
            
            <div className="space-y-6">
              {associatedTrades.map((trade: Trade, index: number) => (
                <div key={trade.id || index} className="border border-primary/15 rounded-lg p-4 bg-background/40 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className={`h-3 w-3 rounded-full ${
                          trade.pnl && Number(trade.pnl) > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <h5 className="font-medium">{trade.instrument || 'Unknown Instrument'}</h5>
                        <Badge variant={trade.direction === 'buy' ? 'variant-success' : 'destructive'}>
                          {trade.direction === 'buy' ? 'Long' : 'Short'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="text-foreground">{trade.entryPrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Exit Price</p>
                          <p className="text-foreground">{trade.exitPrice}</p>
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
                            <p className="text-foreground">{trade.setup}</p>
                          </div>
                        )}
                        {trade.stopLoss && (
                          <div>
                            <p className="text-muted-foreground">Stop Loss</p>
                            <p className="text-foreground">{trade.stopLoss}</p>
                          </div>
                        )}
                        {trade.takeProfit && (
                          <div>
                            <p className="text-muted-foreground">Take Profit</p>
                            <p className="text-foreground">{trade.takeProfit}</p>
                          </div>
                        )}
                      </div>
                      
                      {trade.notes && (
                        <div className="pt-2">
                          <p className="text-muted-foreground text-sm mb-1">Trade Notes</p>
                          <p className="text-sm bg-primary/5 p-2 rounded text-foreground">{trade.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Trade screenshots - fixed to handle both forecastScreenshot and resultUrl/resultScreenshot */}
                  {(trade.forecastScreenshot || trade.resultUrl || trade.resultScreenshot) && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <h6 className="text-sm font-medium mb-2">Trade Screenshots</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trade.forecastScreenshot && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Forecast</p>
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
                        
                        {/* Use either resultUrl or resultScreenshot, whichever is available */}
                        {(trade.resultUrl || trade.resultScreenshot) && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Result</p>
                            <div 
                              onClick={() => openImageInNewTab(trade.resultUrl || trade.resultScreenshot)} 
                              className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                            >
                              <img 
                                src={trade.resultUrl || trade.resultScreenshot} 
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
