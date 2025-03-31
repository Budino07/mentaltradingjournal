import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";

const PREDEFINED_ACTIVITIES = [
  "Meditation",
  "Exercise",
  "Journaling",
  "Healthy Eating",
  "Good Sleep",
  "Affirmation"
];

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
      <p className="font-medium text-sm text-foreground mb-2">{label.replace('\n', ' ')}</p>
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0].color || payload[0].fill }}
        />
        <span className="text-muted-foreground">Performance Impact:</span>
        <span className="font-medium text-foreground">
          {formatValue(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export const PreTradingEvents = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[250px] md:h-[300px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // First, create a mapping of dates to pre-trading activities
  const dateToActivities = new Map<string, string[]>();
  
  analytics.journalEntries.forEach(entry => {
    if (entry.pre_trading_activities && entry.pre_trading_activities.length > 0) {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      dateToActivities.set(date, entry.pre_trading_activities);
    }
  });

  // Then, associate trades with the pre-trading activities for that day
  const activityImpact: Record<string, { totalPnL: number; count: number }> = {};
  
  // Initialize empty records for all predefined activities
  PREDEFINED_ACTIVITIES.forEach(activity => {
    activityImpact[activity] = { totalPnL: 0, count: 0 };
  });
  
  analytics.journalEntries.forEach(entry => {
    if (!entry.trades || entry.trades.length === 0) return;
    
    // Get the date of this entry
    const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
    
    // Get activities from this day's pre-trading session
    const activitiesForToday = dateToActivities.get(entryDate);
    if (!activitiesForToday || activitiesForToday.length === 0) return;
    
    // Calculate P&L for this entry's trades
    const dailyPnL = entry.trades.reduce((sum, trade) => {
      const pnlValue = trade.pnl || trade.profit_loss || 0;
      const numericPnL = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
      return sum + (isNaN(numericPnL) ? 0 : numericPnL);
    }, 0);
    
    // Associate this P&L with all activities from today
    activitiesForToday.forEach(activity => {
      // Map old activity names to new ones
      let normalizedActivity = activity;
      if (activity === "Review Daily Goals") normalizedActivity = "Journaling";
      if (activity === "Cold Shower") normalizedActivity = "Healthy Eating";
      
      if (PREDEFINED_ACTIVITIES.includes(normalizedActivity)) {
        activityImpact[normalizedActivity].totalPnL += dailyPnL;
        activityImpact[normalizedActivity].count += 1;
        
        console.log(`Associating activity '${normalizedActivity}' with P&L: $${dailyPnL} on date ${entryDate}`);
      }
    });
  });

  // Calculate average impact for each predefined activity
  const data = PREDEFINED_ACTIVITIES.map(activity => {
    const stats = activityImpact[activity];
    const averageImpact = stats.count > 0 ? (stats.totalPnL / stats.count) : 0;
    
    console.log(`${activity}: Total P&L: $${stats.totalPnL}, Count: ${stats.count}, Average: $${averageImpact.toFixed(2)}`);
    
    return {
      activity,
      impact: parseFloat(averageImpact.toFixed(2)),
      fill: averageImpact > 0 ? "#6E59A5" : "#FEC6A1"
    };
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Find most positive and negative impacts for insights
  const mostPositive = data.reduce((prev, current) => 
    current.impact > prev.impact ? current : prev, { impact: -Infinity, activity: '' });
  const mostNegative = data.reduce((prev, current) => 
    current.impact < prev.impact ? current : prev, { impact: Infinity, activity: '' });

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Pre-Trading Activities Impact</h3>
        <p className="text-sm text-muted-foreground">
          How different activities affect your trading performance
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 5, left: 25, bottom: 5 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="activity" 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              tickLine={{ stroke: 'currentColor' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              tickLine={{ stroke: 'currentColor' }}
              tickFormatter={formatValue}
              width={80}
              label={{ 
                value: 'Average P&L per Trade', 
                angle: -90, 
                position: 'insideLeft',
                offset: 10,
                style: { 
                  textAnchor: 'middle',
                  fontSize: '12px',
                  fill: 'currentColor'
                }
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'currentColor', opacity: 0.1 }}
            />
            <Bar 
              dataKey="impact"
              fill="#6E59A5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">Activity Impact Analysis</h4>
        <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
          {mostPositive.activity && (
            <p><span className="font-medium text-foreground">{mostPositive.activity.replace(/\n/g, ' ')}</span> shows the strongest positive impact on your trading, improving performance by {formatValue(mostPositive.impact)}.</p>
          )}
          {mostNegative.activity && mostNegative.impact < 0 && (
            <p>Consider reviewing your {mostNegative.activity.toLowerCase().replace(/\n/g, ' ')} routine, as it correlates with a {formatValue(Math.abs(mostNegative.impact))} decrease in performance.</p>
          )}
        </div>
      </div>
    </Card>
  );
};
