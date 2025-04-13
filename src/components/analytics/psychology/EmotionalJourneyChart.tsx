
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
import { BehavioralPatterns } from './BehavioralPatterns';
import { generateEmotionalData, EnhancedEmotionalDataPoint } from '@/utils/psychology/coreNeedsAnalysis';

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

  // Use our utility for emotional data generation
  const emotionalData = React.useMemo(() => {
    if (!analyticsData?.journalEntries?.length) return [];
    
    return generateEmotionalData(analyticsData.journalEntries);
  }, [analyticsData?.journalEntries]);

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
    <Card className="w-full max-w-[100vw] overflow-hidden border border-primary/10 bg-card/30 backdrop-blur-md">
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
      <CardContent className="pb-6 pt-2 w-full">
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
        
        <div className="mt-8">
          <BehavioralPatterns 
            journalEntries={analyticsData?.journalEntries || []}
          />
        </div>
      </CardContent>
    </Card>
  );
};
