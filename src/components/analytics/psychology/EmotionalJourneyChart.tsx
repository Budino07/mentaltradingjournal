import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { generateAnalytics } from '@/utils/analyticsUtils';
import { CoreNeedsMatrix } from './CoreNeedsMatrix';
import { EmotionalWaveform } from './EmotionalWaveform';
import { ReflectionEntries } from './ReflectionEntries';
import { PersonalityInsights } from './PersonalityInsights';
import { EmotionalPatternGuardrails } from './EmotionalPatternGuardrails';

export const EmotionalJourneyChart = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [focusDay, setFocusDay] = useState<Date | null>(null);
  
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  
  const getDaysForTimeframe = () => {
    const today = new Date();
    const days = [];
    const daysToShow = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      days.push(subDays(today, i));
    }
    
    return days;
  };
  
  const days = getDaysForTimeframe();

  const emotionalData = React.useMemo(() => {
    if (!analyticsData?.journalEntries?.length) return [];
    
    return days.map(day => {
      const dayEntries = analyticsData.journalEntries.filter(entry => 
        new Date(entry.created_at).toDateString() === day.toDateString()
      );
      
      const preSession = dayEntries.find(entry => entry.session_type === 'pre');
      const postSession = dayEntries.find(entry => entry.session_type === 'post');
      
      // Calculate emotional intensity score (-10 to +10)
      const calculateEmotionalScore = (entry: any) => {
        if (!entry) return null;
        
        const emotion = entry.emotion?.toLowerCase() || '';
        
        if (['happy', 'confident', 'calm', 'focused', 'optimistic'].includes(emotion)) {
          return 5 + Math.random() * 5; // Positive emotions (5 to 10)
        } else if (['neutral', 'content', 'reflective'].includes(emotion)) {
          return -2 + Math.random() * 4; // Neutral emotions (-2 to 2)
        } else if (['anxious', 'scared', 'frustrated', 'angry', 'sad'].includes(emotion)) {
          return -10 + Math.random() * 5; // Negative emotions (-10 to -5)
        }
        
        return 0; // Default
      };
      
      // Extract trades performance for this day
      const dayTrades = dayEntries
        .filter(entry => entry.trades && entry.trades.length > 0)
        .flatMap(entry => entry.trades || []);
      
      const tradePnL = dayTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                 typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0);
      
      // Calculate emotional change intensity
      const preScore = calculateEmotionalScore(preSession);
      const postScore = calculateEmotionalScore(postSession);
      const emotionalChange = preScore !== null && postScore !== null 
        ? postScore - preScore 
        : null;
      
      // Determine core needs based on journal content
      const notes = [preSession?.notes, postSession?.notes].filter(Boolean).join(' ').toLowerCase();
      
      let coreNeed = 'unknown';
      if (notes.includes('control') || notes.includes('manage') || notes.includes('discipline')) {
        coreNeed = 'control';
      } else if (notes.includes('validation') || notes.includes('acknowledge') || notes.includes('recognition')) {
        coreNeed = 'validation';
      } else if (notes.includes('safe') || notes.includes('security') || notes.includes('protect')) {
        coreNeed = 'safety';
      } else if (notes.includes('connect') || notes.includes('belong') || notes.includes('relationship')) {
        coreNeed = 'connection';
      } else if (notes.includes('grow') || notes.includes('improve') || notes.includes('learn')) {
        coreNeed = 'growth';
      }
      
      // Generate reflection summary
      const reflection = postSession?.notes || '';
      
      // Identify potential harmful patterns
      const hasHarmfulPattern = postSession ? 
        (postSession.emotion === 'angry' && tradePnL < 0) || 
        ((postSession.emotion === 'confident' || postSession.emotion === 'excited') && tradePnL > 100) : 
        false;
      
      return {
        date: day,
        formattedDate: format(day, 'MMM dd'),
        preScore,
        postScore,
        emotionalChange,
        preEmotion: preSession?.emotion || null,
        postEmotion: postSession?.emotion || null,
        tradePnL,
        reflection,
        coreNeed,
        hasHarmfulPattern,
        patternType: hasHarmfulPattern ? 
          (tradePnL < 0 ? 'revenge trading' : 'overconfidence') : 
          null
      };
    }).filter(item => item.preScore !== null || item.postScore !== null);
  }, [analyticsData, days]);

  const handleDayClick = (day: Date) => {
    setFocusDay(day);
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[500px] animate-pulse bg-muted/30">
        <CardHeader>
          <div className="h-6 w-64 bg-muted rounded"></div>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="h-4 w-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden border border-primary/10 bg-card/30 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl text-gradient-primary">
            Emotional Trading Journey
          </CardTitle>
          <Tabs 
            value={timeframe} 
            onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'quarter')}
            className="self-start"
          >
            <TabsList className="bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-2">
        <div className="relative h-[400px] w-full">
          <EmotionalWaveform 
            emotionalData={emotionalData}
            onDayClick={handleDayClick}
          />
        </div>
        
        <div className="mt-6">
          {focusDay && (
            <ReflectionEntries 
              emotionalData={emotionalData.find(item => 
                item.date.toDateString() === focusDay.toDateString()
              )}
              onClose={() => setFocusDay(null)}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <CoreNeedsMatrix 
            emotionalData={emotionalData}
          />
          <PersonalityInsights />
        </div>
        
        <div className="mt-8">
          <EmotionalPatternGuardrails 
            emotionalData={emotionalData}
          />
        </div>
      </CardContent>
    </Card>
  );
};
