import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, isAfter } from "date-fns";
import { formatDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

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

    const postSessionEntries = analytics.journalEntries.filter(entry => 
      entry.session_type === 'post'
    );

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

    return Object.keys(emotionCounts).map(emotion => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
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
  
  const generateInsights = () => {
    if (!hasData) {
      return {
        primary: "No emotional data available for this time period.",
        secondary: "Record your post-session emotions to gain insights."
      };
    }
    
    const totalSessions = emotionData.reduce((sum, item) => sum + item.count, 0);
    const positiveCount = emotionData.find(item => item.emotion === "Positive")?.count || 0;
    const negativeCount = emotionData.find(item => item.emotion === "Negative")?.count || 0;
    const neutralCount = emotionData.find(item => item.emotion === "Neutral")?.count || 0;
    
    const positivePercentage = totalSessions > 0 ? Math.round((positiveCount / totalSessions) * 100) : 0;
    const negativePercentage = totalSessions > 0 ? Math.round((negativeCount / totalSessions) * 100) : 0;
    
    let primary = "";
    let secondary = "";
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      primary = `${positivePercentage}% of your sessions resulted in positive emotions.`;
      secondary = "You're consistently feeling satisfied with your trading sessions.";
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      primary = `${negativePercentage}% of your sessions resulted in negative emotions.`;
      secondary = "Consider reviewing your trading strategy or risk management approach.";
    } else if (neutralCount > positiveCount && neutralCount > negativeCount) {
      primary = "Most of your sessions resulted in neutral emotions.";
      secondary = "Your emotional state remains balanced after trading sessions.";
    } else {
      primary = `Your emotional states are evenly distributed.`;
      secondary = "This indicates balanced emotional responses to your trading sessions.";
    }
    
    return { primary, secondary };
  };
  
  const insights = generateInsights();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Post-Session Emotional States</CardTitle>
        <CardDescription>Frequency of emotional states after trading sessions {getTimeFilterLabel()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
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
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="emotion" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ 
                    fontSize: 12,
                    fill: "hsl(var(--foreground))"
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  label={{ 
                    value: 'Count', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 0,
                    style: { 
                      textAnchor: 'middle', 
                      fontSize: '10px', 
                      fill: 'hsl(var(--muted-foreground))'
                    }
                  }}
                  width={20}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ 
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value) => [
                    <span className="text-foreground">Count: {value} sessions</span>, 
                    ''
                  ]}
                  labelFormatter={(label) => (
                    <span className="text-foreground">{label}</span>
                  )}
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

        <div className="bg-accent/10 p-4 rounded-lg space-y-1 mt-4">
          <h4 className="font-medium text-sm">AI Insight</h4>
          <p className="text-sm text-muted-foreground">{insights.primary}</p>
          <p className="text-xs text-muted-foreground">{insights.secondary}</p>
        </div>
      </CardContent>
    </Card>
  );
};
