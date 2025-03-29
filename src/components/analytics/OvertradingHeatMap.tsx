
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { JournalEntry, Trade } from "@/types/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { AlertTriangle, Flame, Info } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Prepare week data
  const weekData = useMemo(() => {
    if (allTrades.length === 0) return [];
    
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: Record<string, { day: string, count: number, emotion: string }> = {};
    
    daysOfWeek.forEach(day => {
      dayMap[day] = { day, count: 0, emotion: 'positive' };
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
    
    return Object.values(dayMap);
  }, [allTrades]);

  // Prepare hourly data
  const hourlyData = useMemo(() => {
    if (allTrades.length === 0) return [];
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourMap: Record<number, { hour: number, count: number, emotion: string }> = {};
    
    hours.forEach(hour => {
      hourMap[hour] = { hour, count: 0, emotion: 'positive' };
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
    
    return Object.values(hourMap);
  }, [allTrades]);

  // Identify problematic periods
  const problematicPeriods = useMemo(() => {
    if (view === 'week') {
      return weekData
        .filter(item => item.count > overtradingThreshold && item.emotion === 'negative')
        .map(item => item.day);
    } else {
      return hourlyData
        .filter(item => item.count > overtradingThreshold && item.emotion === 'negative')
        .map(item => `${item.hour}:00`);
    }
  }, [weekData, hourlyData, overtradingThreshold, view]);

  // Generate AI insights
  const generateInsights = () => {
    if (allTrades.length === 0) {
      return "Start logging trades to see overtrading insights.";
    }
    
    if (problematicPeriods.length === 0) {
      return "No emotionally-driven overtrading detected. Your trading volume appears consistent with your typical patterns.";
    }
    
    if (view === 'week') {
      return `Potential emotional overtrading detected on ${problematicPeriods.join(', ')}. These days show higher than normal trading activity during negative emotional states.`;
    } else {
      return `Potential emotional overtrading detected at ${problematicPeriods.join(', ')}. These hours show higher than normal trading activity during negative emotional states.`;
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

  // Custom tooltip
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
              variant={isOvertrading ? "destructive" : isApproachingThreshold ? "warning" : "success"}
              className="text-xs"
            >
              {isOvertrading ? 'Overtrading' : isApproachingThreshold ? 'Approaching Limit' : 'Normal Volume'}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  // Bar fill color based on count and emotion
  const getBarFill = (entry: any) => {
    if (entry.count > overtradingThreshold) {
      return entry.emotion === 'negative' ? '#ef4444' : '#f97316'; // Red or orange
    } else if (entry.count > warningThreshold) {
      return '#facc15'; // Yellow
    } else {
      return '#22c55e'; // Green
    }
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
              <Tooltip content={<CustomTooltip />} />
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
                fill={(entry: any) => getBarFill(entry)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {hasOvertrading && (
          <div className="mt-4 p-3 border rounded-md bg-destructive/10 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Overtrading Alert</h4>
              <p className="text-sm text-muted-foreground">{generateInsights()}</p>
            </div>
          </div>
        )}
        
        {!hasOvertrading && (
          <div className="mt-4 p-3 border rounded-md bg-primary/10 flex gap-3 items-start">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Trading Volume Analysis</h4>
              <p className="text-sm text-muted-foreground">{generateInsights()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
