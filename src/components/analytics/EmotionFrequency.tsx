
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, isAfter } from "date-fns";

export const EmotionFrequency = () => {
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "quarter" | "year">("month");
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const emotionData = useMemo(() => {
    if (!analytics?.journalEntries || analytics.journalEntries.length === 0) {
      return [];
    }

    // Filter post-session entries only
    const postSessionEntries = analytics.journalEntries.filter(entry => 
      entry.session_type === 'post'
    );

    // Apply time filter
    const now = new Date();
    let startDate;
    
    switch (timeFilter) {
      case "week":
        startDate = startOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "quarter":
        startDate = startOfQuarter(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
    }

    const filteredEntries = postSessionEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return isAfter(entryDate, startDate);
    });

    // Count emotions
    const emotionCounts = {
      "positive": 0,
      "neutral": 0,
      "negative": 0
    };

    filteredEntries.forEach(entry => {
      if (entry.emotion in emotionCounts) {
        emotionCounts[entry.emotion as keyof typeof emotionCounts]++;
      }
    });

    // Transform to chart data format
    return Object.keys(emotionCounts).map(emotion => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1), // Capitalize
      count: emotionCounts[emotion as keyof typeof emotionCounts]
    }));
  }, [analytics, timeFilter]);

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "positive":
        return "hsl(142.1 76.2% 36.3%)";
      case "neutral":
        return "hsl(215.4 16.3% 46.9%)";
      case "negative":
        return "hsl(346.8 77.2% 49.8%)";
      default:
        return "hsl(215.4 16.3% 46.9%)";
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "quarter":
        return "This Quarter";
      case "year":
        return "This Year";
      default:
        return "This Month";
    }
  };

  const hasData = emotionData.some(item => item.count > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Post-Session Emotional States</CardTitle>
        <CardDescription>Frequency of emotional states after trading sessions {getTimeFilterLabel()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="month" className="w-full" onValueChange={(value) => setTimeFilter(value as any)}>
          <TabsList className="mb-4 w-full grid grid-cols-4">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="h-[250px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !hasData ? (
          <div className="h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              No post-session data available for {getTimeFilterLabel().toLowerCase()}.
              <br />
              Add more journal entries to see trends.
            </p>
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={emotionData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="emotion" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  label={{ 
                    value: 'Count', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '12px', textAnchor: 'middle' },
                    dx: -15
                  }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ 
                    fontWeight: 'bold',
                    marginBottom: '4px',
                  }}
                  formatter={(value) => [`${value} sessions`, 'Count']}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                >
                  {emotionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getEmotionColor(entry.emotion)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
