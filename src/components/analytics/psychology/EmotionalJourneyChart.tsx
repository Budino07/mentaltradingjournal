
import React, { useState, useMemo } from 'react';
import { format, subDays, subMonths, isAfter } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { generateAnalytics } from '@/utils/analyticsUtils';
import { CoreTraitsMatrix } from './CoreTraitsMatrix';
import { EmotionalWaveform } from './EmotionalWaveform';
import { ReflectionEntries } from './ReflectionEntries';
import { PersonalityInsights } from './PersonalityInsights';
import { EmotionalPatternGuardrails } from './EmotionalPatternGuardrails';
import { BehavioralPatterns } from './BehavioralPatterns';
import { generateEmotionalData, EnhancedEmotionalDataPoint } from '@/utils/psychology/coreTraitsAnalysis';

export const EmotionalJourneyChart = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [focusDay, setFocusDay] = useState<Date | null>(null);
  
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  // Filter and aggregate data based on timeframe
  const filteredEmotionalData = useMemo(() => {
    if (!analyticsData?.journalEntries?.length) return [];
    
    // Generate the full dataset
    const fullData = generateEmotionalData(analyticsData.journalEntries);
    
    // Apply timeframe filtering
    const today = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case 'week':
        cutoffDate = subDays(today, 7);
        break;
      case 'month':
        cutoffDate = subDays(today, 30);
        break;
      case 'quarter':
        cutoffDate = subMonths(today, 3);
        break;
      default:
        cutoffDate = subDays(today, 7);
    }
    
    // Filter the data to only include dates after the cutoff
    const filteredData = fullData.filter(item => isAfter(item.date, cutoffDate));
    
    // Aggregate data by date to remove duplicates
    const aggregatedMap = new Map<string, EnhancedEmotionalDataPoint>();
    
    filteredData.forEach(item => {
      const dateKey = format(item.date, 'yyyy-MM-dd');
      
      if (aggregatedMap.has(dateKey)) {
        // Update existing entry with this day's data
        const existing = aggregatedMap.get(dateKey)!;
        
        // Prioritize emotional states if present
        if (item.preScore !== null) existing.preScore = item.preScore;
        if (item.postScore !== null) existing.postScore = item.postScore;
        if (item.preEmotion) existing.preEmotion = item.preEmotion;
        if (item.postEmotion) existing.postEmotion = item.postEmotion;
        
        // Combine reflections
        if (item.reflection && item.reflection.trim() !== '') {
          if (existing.reflection && existing.reflection.trim() !== '') {
            existing.reflection += '\n\n' + item.reflection;
          } else {
            existing.reflection = item.reflection;
          }
        }
        
        // Update core trait if available
        if (item.coreTrait) existing.coreTrait = item.coreTrait;
        
        // Accumulate trading P&L
        existing.tradePnL += item.tradePnL;
        
        // Keep track of harmful patterns
        if (item.hasHarmfulPattern) {
          existing.hasHarmfulPattern = true;
          if (item.patternType) {
            existing.patternType = item.patternType;
          }
        }
      } else {
        // First entry for this date
        aggregatedMap.set(dateKey, { ...item });
      }
    });
    
    // Convert map back to array and sort by date
    return Array.from(aggregatedMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [analyticsData?.journalEntries, timeframe]);

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

  // Empty state message when no data is available for the selected timeframe
  if (filteredEmotionalData.length === 0) {
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
          <div className="relative h-[400px] w-full flex items-center justify-center flex-col gap-4">
            <p className="text-lg text-muted-foreground">No emotional data available for the selected timeframe</p>
            <p className="text-sm text-muted-foreground">Try selecting a different time period or add journal entries</p>
          </div>
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
            emotionalData={filteredEmotionalData}
            onDayClick={handleDayClick}
          />
        </div>
        
        <div className="mt-6">
          {focusDay && (
            <ReflectionEntries 
              emotionalData={filteredEmotionalData.find(item => 
                item.date.toDateString() === focusDay.toDateString()
              )}
              onClose={() => setFocusDay(null)}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <CoreTraitsMatrix 
            emotionalData={filteredEmotionalData}
          />
          <PersonalityInsights />
        </div>
        
        <div className="mt-8">
          <EmotionalPatternGuardrails 
            emotionalData={filteredEmotionalData}
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
