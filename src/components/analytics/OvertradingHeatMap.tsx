
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { JournalEntry, Trade } from "@/types/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { AlertTriangle, Flame, HelpCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const OvertradingHeatMap = () => {
  const [view, setView] = useState<'week' | 'hour'>('week');
  
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics
  });

  // Get all trades from journal entries
  const allTrades = useMemo(() => {
    if (!analyticsData?.journalEntries) return [];
    
    return analyticsData.journalEntries.flatMap(entry => 
      (entry.trades || []).map(trade => ({
        ...trade,
        entryDate: trade.entryDate || '',
        entryTime: trade.entryDate ? new Date(trade.entryDate).getHours() : 0,
        day: trade.entryDate ? format(new Date(trade.entryDate), 'EEE') : '',
        emotion: entry.emotion
      }))
    );
  }, [analyticsData?.journalEntries]);

  // Calculate average trades per day
  const avgTradesPerDay = useMemo(() => {
    if (allTrades.length === 0) return 0;
    
    const dayTradeMap = allTrades.reduce((acc, trade) => {
      if (!trade.entryDate) return acc;
      
      const day = format(new Date(trade.entryDate), 'yyyy-MM-dd');
      if (!acc[day]) acc[day] = 0;
      acc[day]++;
      return acc;
    }, {} as Record<string, number>);
    
    const days = Object.keys(dayTradeMap).length;
    const totalTrades = Object.values(dayTradeMap).reduce((sum, count) => sum + count, 0);
    
    return days > 0 ? Math.round(totalTrades / days) : 0;
  }, [allTrades]);

  // Calculate overtrading threshold (30% above average)
  const overtradingThreshold = Math.round(avgTradesPerDay * 1.3);
  const warningThreshold = Math.round(avgTradesPerDay * 1.1);

  // Get the number of unique trading days for explanation
  const tradingDaysCount = useMemo(() => {
    if (allTrades.length === 0) return 0;
    
    const uniqueDays = new Set();
    allTrades.forEach(trade => {
      if (trade.entryDate) {
        uniqueDays.add(format(new Date(trade.entryDate), 'yyyy-MM-dd'));
      }
    });
    
    return uniqueDays.size;
  }, [allTrades]);

  // Prepare week data
  const weekData = useMemo(() => {
    if (allTrades.length === 0) return [];
    
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, { day: string; count: number; emotion: string; fill: string }> = {};
    
    daysOfWeek.forEach(day => {
      dayMap[day] = { day, count: 0, emotion: 'positive', fill: '#22c55e' };
    });
    
    allTrades.forEach(trade => {
      if (!trade.day) return;
      
      dayMap[trade.day].count++;
      
      // If there are multiple emotions for a day, prioritize negative > neutral > positive
      if (trade.emotion === 'negative') {
        dayMap[trade.day].emotion = 'negative';
      } else if (trade.emotion === 'neutral' && dayMap[trade.day].emotion !== 'negative') {
        dayMap[trade.day].emotion = 'neutral';
      }
    });
    
    // Now set the fill color based on count and emotion
    Object.values(dayMap).forEach(day => {
      if (day.count > overtradingThreshold) {
        if (day.emotion === 'negative') {
          day.fill = '#ef4444'; // Red for negative emotions
        } else if (day.emotion === 'neutral') {
          day.fill = '#a855f7'; // Purple for neutral emotions
        } else {
          day.fill = '#f97316'; // Orange for positive emotions
        }
      } else if (day.count > warningThreshold) {
        day.fill = '#facc15'; // Yellow for approaching threshold
      } else {
        day.fill = '#22c55e'; // Green for normal trading
      }
    });
    
    return Object.values(dayMap);
  }, [allTrades, overtradingThreshold, warningThreshold]);

  // Prepare hourly data
  const hourlyData = useMemo(() => {
    if (allTrades.length === 0) return [];
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourMap: Record<number, { hour: number; count: number; emotion: string; fill: string }> = {};
    
    hours.forEach(hour => {
      hourMap[hour] = { hour, count: 0, emotion: 'positive', fill: '#22c55e' };
    });
    
    allTrades.forEach(trade => {
      if (trade.entryTime === undefined) return;
      
      hourMap[trade.entryTime].count++;
      
      // If there are multiple emotions for an hour, prioritize negative > neutral > positive
      if (trade.emotion === 'negative') {
        hourMap[trade.entryTime].emotion = 'negative';
      } else if (trade.emotion === 'neutral' && hourMap[trade.entryTime].emotion !== 'negative') {
        hourMap[trade.entryTime].emotion = 'neutral';
      }
    });
    
    // Set the fill color based on count and emotion
    Object.values(hourMap).forEach(hour => {
      if (hour.count > overtradingThreshold) {
        if (hour.emotion === 'negative') {
          hour.fill = '#ef4444'; // Red for negative emotions
        } else if (hour.emotion === 'neutral') {
          hour.fill = '#a855f7'; // Purple for neutral emotions
        } else {
          hour.fill = '#f97316'; // Orange for positive emotions
        }
      } else if (hour.count > warningThreshold) {
        hour.fill = '#facc15'; // Yellow for approaching threshold
      } else {
        hour.fill = '#22c55e'; // Green for normal trading
      }
    });
    
    return Object.values(hourMap);
  }, [allTrades, overtradingThreshold, warningThreshold]);

  // Identify problematic periods
  const problematicPeriods = useMemo(() => {
    if (view === 'week') {
      return weekData
        .filter(item => item.count > overtradingThreshold && (item.emotion === 'negative' || item.emotion === 'neutral'))
        .map(item => item.day);
    } else {
      return hourlyData
        .filter(item => item.count > overtradingThreshold && (item.emotion === 'negative' || item.emotion === 'neutral'))
        .map(item => `${item.hour}:00`);
    }
  }, [weekData, hourlyData, overtradingThreshold, view]);

  // Generate AI insights
  const generateInsights = () => {
    if (allTrades.length === 0) {
      return "Start logging trades to see overtrading insights.";
    }
    
    if (problematicPeriods.length === 0) {
      return "No overtrading detected. Your trading volume appears consistent with your typical patterns.";
    }
    
    if (view === 'week') {
      return `Potential emotional overtrading detected on ${problematicPeriods.join(', ')}. These days show higher than normal trading activity during negative or neutral emotional states.`;
    } else {
      return `Potential emotional overtrading detected at ${problematicPeriods.join(', ')}. These hours show higher than normal trading activity during negative or neutral emotional states.`;
    }
  };

  // Determine if there is any overtrading
  const hasOvertrading = useMemo(() => {
    if (view === 'week') {
      return weekData.some(item => item.count > overtradingThreshold);
    } else {
      return hourlyData.some(item => item.count > overtradingThreshold);
    }
  }, [weekData, hourlyData, overtradingThreshold, view]);

  // Explanation for how average is calculated
  const averageExplanation = useMemo(() => {
    if (tradingDaysCount === 0) return "";
    
    return `Based on your ${tradingDaysCount} trading days, you average ${avgTradesPerDay} trades per day. Overtrading is defined as exceeding this average by 30% (${overtradingThreshold}+ trades).`;
  }, [avgTradesPerDay, overtradingThreshold, tradingDaysCount]);

  // Color explanation to help users understand the chart
  const colorExplanation = useMemo(() => {
    return [
      { color: "#22c55e", label: "Normal trading volume" },
      { color: "#facc15", label: "Approaching overtrading threshold" },
      { color: "#f97316", label: "Overtrading with positive emotions" },
      { color: "#a855f7", label: "Overtrading with neutral emotions" },
      { color: "#ef4444", label: "Overtrading with negative emotions" },
    ];
  }, []);

  // Show more info about the calculations
  const handleShowMoreInfo = () => {
    toast({
      title: "How Overtrading is Calculated",
      description: `Your average of ${avgTradesPerDay} trades per day is calculated by dividing your total trades (${allTrades.length}) by your unique trading days (${tradingDaysCount}). Trading more than ${overtradingThreshold} trades in a day is considered overtrading. The emotional state during overtrading periods is also considered.`,
      duration: 8000,
    });
  };

  // Custom tooltip with transparent background
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOvertrading = data.count > overtradingThreshold;
      const isApproachingThreshold = data.count > warningThreshold && data.count <= overtradingThreshold;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm p-3 rounded-md border shadow-md">
          <p className="font-medium">{view === 'week' ? data.day : `${data.hour}:00`}</p>
          <p className="text-sm">Trades: <span className="font-semibold">{data.count}</span></p>
          <p className="text-sm">Emotion: <span className="font-semibold capitalize">{data.emotion}</span></p>
          <div className="mt-1">
            <Badge 
              variant={isOvertrading ? (data.emotion === "negative" ? "destructive" : data.emotion === "neutral" ? "neutral" : "warning") : isApproachingThreshold ? "warning" : "success"}
              className="text-xs"
            >
              {isOvertrading ? `Overtrading (${data.emotion})` : isApproachingThreshold ? 'Approaching Limit' : 'Normal Volume'}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Overtrading Heat Map
          </CardTitle>
          <CardDescription>Loading trader activity patterns...</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData || allTrades.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Overtrading Heat Map
          </CardTitle>
          <CardDescription>Track your trading frequency to detect overtrading patterns</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex flex-col items-center justify-center text-center p-6">
          <Info className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No Trading Data Available</h3>
          <p className="text-muted-foreground max-w-md">
            Add trading journal entries to visualize your trading patterns and detect potential overtrading.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              Overtrading Heat Map
            </CardTitle>
            <CardDescription>Track your trading frequency to detect emotional overtrading</CardDescription>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'week' | 'hour')}>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="week">By Day</TabsTrigger>
              <TabsTrigger value="hour">By Hour</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end mb-2 gap-1">
          <div className="text-xs text-muted-foreground">Understanding colors:</div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Color explanation</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Heat Map Color Guide</h4>
                <div className="space-y-1.5">
                  {colorExplanation.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  Overtrading occurs when you exceed your daily average by more than 30%. 
                  The emotional state associated with overtrading periods is important:
                  negative emotions may indicate emotional trading decisions, 
                  neutral emotions suggest potential autopilot trading,
                  while positive emotions may lead to overconfidence.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={view === 'week' ? weekData : hourlyData}
              margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
              <XAxis 
                dataKey={view === 'week' ? 'day' : 'hour'} 
                tick={{ fontSize: 12 }}
                tickFormatter={view === 'hour' ? (value) => `${value}:00` : undefined}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Number of Trades', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 12, fill: '#888' }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{fill: 'transparent'}}  // This removes the white background on hover
              />
              <Legend />
              <ReferenceLine 
                y={avgTradesPerDay} 
                stroke="#3b82f6"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ 
                  value: 'Avg Trade Count', 
                  position: 'right',
                  fill: '#3b82f6',
                  fontSize: 12
                }}
              />
              <ReferenceLine 
                y={overtradingThreshold} 
                stroke="#ef4444"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ 
                  value: 'Overtrading Threshold', 
                  position: 'right',
                  fill: '#ef4444',
                  fontSize: 12
                }}
              />
              <Bar 
                dataKey="count" 
                name="Trade Count"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
                strokeWidth={1}
                stroke="#000"
                strokeOpacity={0.1}
                animationDuration={1000}
                animationEasing="ease-out"
                isAnimationActive={true}
                barSize={view === 'hour' ? 16 : 30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {hasOvertrading && (
          <div className="mt-4 p-3 border rounded-md bg-destructive/10 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="w-full">
              <h4 className="text-sm font-medium">Overtrading Alert</h4>
              <p className="text-sm text-muted-foreground">{generateInsights()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {averageExplanation} <strong>Orange bars</strong> indicate overtrading with positive emotions, <strong>purple bars</strong> indicate overtrading with neutral emotions, while <strong>red bars</strong> indicate overtrading with negative emotions.
                <button 
                  onClick={handleShowMoreInfo}
                  className="ml-1 text-primary underline hover:no-underline"
                >
                  Learn more
                </button>
              </p>
            </div>
          </div>
        )}
        
        {!hasOvertrading && (
          <div className="mt-4 p-3 border rounded-md bg-primary/10 flex gap-3 items-start">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="w-full">
              <h4 className="text-sm font-medium">Trading Volume Analysis</h4>
              <p className="text-sm text-muted-foreground">{generateInsights()}</p>
              {tradingDaysCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {averageExplanation} <strong>Green bars</strong> indicate normal trading volume, while <strong>yellow bars</strong> indicate approaching the overtrading threshold.
                  <button 
                    onClick={handleShowMoreInfo}
                    className="ml-1 text-primary underline hover:no-underline"
                  >
                    Learn more
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
