
import { Card } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const getEmotionColor = (emotion: string): string => {
  switch (emotion.toLowerCase()) {
    case 'positive':
      return '#22c55e';
    case 'negative':
      return '#ef4444';
    default:
      return '#eab308';
  }
};

const calculateCorrelation = (data: any[]) => {
  const n = data.length;
  if (n === 0) return 0;

  const emotionToNumber = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'positive': return 1;
      case 'negative': return -1;
      default: return 0;
    }
  };

  const emotionValues = data.map(d => emotionToNumber(d.emotion));
  const pnlValues = data.map(d => d.pnl);
  
  const meanEmotion = emotionValues.reduce((a, b) => a + b, 0) / n;
  const meanPnL = pnlValues.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomEmotionSquared = 0;
  let denomPnLSquared = 0;

  for (let i = 0; i < n; i++) {
    const emotionDiff = emotionValues[i] - meanEmotion;
    const pnlDiff = pnlValues[i] - meanPnL;
    
    numerator += emotionDiff * pnlDiff;
    denomEmotionSquared += emotionDiff * emotionDiff;
    denomPnLSquared += pnlDiff * pnlDiff;
  }

  const r = numerator / Math.sqrt(denomEmotionSquared * denomPnLSquared);
  return isNaN(r) ? 0 : r;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
        <p className="font-medium text-sm text-foreground mb-2">
          {format(new Date(data.originalDate), 'MMM d, yyyy')}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getEmotionColor(data.emotion) }}
            />
            <span className="text-muted-foreground">Emotional State:</span>
            <span className="font-medium text-foreground capitalize">
              {data.emotion}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">P&L:</span>
            <span className="font-medium text-foreground">
              ${formatValue(data.pnl)}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Click to view journal entries
        </div>
      </div>
    );
  }
  return null;
};

export const EmotionTrend = () => {
  const navigate = useNavigate();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });
  
  if (isLoading || !analytics) {
    return (
      <Card className="p-4 md:p-6 space-y-4 col-span-2">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/10 rounded w-3/4"></div>
          <div className="h-[400px] bg-accent/10 rounded"></div>
        </div>
      </Card>
    );
  }

  // Create a proper map of dates to emotions, ensuring we use consistent date formats
  const preSessionEmotions = analytics.journalEntries
    .filter(entry => entry.session_type === 'pre')
    .reduce((acc, entry) => {
      // Ensure all dates are stored in a consistent ISO format
      const dateObj = new Date(entry.created_at);
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      acc[dateKey] = entry.emotion;
      return acc;
    }, {} as Record<string, string>);

  // Process trades with consistent date handling
  const tradesByDate = analytics.journalEntries
    .flatMap(entry => 
      entry.trades?.map(trade => {
        const dateObj = new Date(trade.entryDate || entry.created_at);
        const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        return {
          date: dateKey,
          pnl: Number(trade.pnl) || 0,
        };
      }) || []
    )
    .reduce((acc, { date, pnl }) => {
      if (!acc[date]) acc[date] = [];
      acc[date].push(pnl);
      return acc;
    }, {} as Record<string, number[]>);

  // Generate scatter data using the consistent date keys
  const scatterData = Object.entries(tradesByDate).map(([dateKey, pnls]) => {
    const dateObj = new Date(dateKey);
    return {
      originalDate: dateObj.getTime(), // Store the original timestamp for sorting and display
      dateString: format(dateObj, 'MMM d'), // Formatted date for display
      pnl: pnls.reduce((sum, pnl) => sum + pnl, 0),
      emotion: preSessionEmotions[dateKey] || 'neutral'
    };
  }).sort((a, b) => a.originalDate - b.originalDate); // Sort by date

  // Transform data to use index-based positioning for even spacing
  const transformedData = scatterData.map((item, index) => ({
    ...item,
    index, // Use index for positioning on x-axis
    date: index, // Replace date with index for even spacing
  }));

  const positiveData = transformedData.filter(d => d.emotion === 'positive');
  const neutralData = transformedData.filter(d => d.emotion === 'neutral');
  const negativeData = transformedData.filter(d => d.emotion === 'negative');

  const allPnls = scatterData.map(d => d.pnl);
  const bestPerformance = Math.max(...allPnls);
  const worstPerformance = Math.min(...allPnls);

  const correlationCoefficient = calculateCorrelation(scatterData);
  const correlationStrength = Math.abs(correlationCoefficient);
  const correlationDescription = correlationStrength >= 0.7 ? 'strong' :
    correlationStrength >= 0.5 ? 'moderate' :
    correlationStrength >= 0.3 ? 'weak' : 'very weak';

  const handleDataPointClick = (data: any) => {
    // Use originalDate for navigation, which contains the actual timestamp
    const date = new Date(data.originalDate);
    navigate('/dashboard', { 
      state: { 
        selectedDate: date
      }
    });
  };

  // Create custom tick values and labels for the x-axis
  const xAxisTicks = transformedData.map((item, index) => index);
  const xAxisLabels = transformedData.map(item => item.dateString);

  return (
    <Card className="p-4 md:p-6 space-y-4 col-span-2">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Emotional State vs. Trading Performance</h3>
        <p className="text-sm text-muted-foreground">
          Scatter plot showing the relationship between emotional states and trading results
        </p>
        <p className="text-sm font-medium">
          Correlation (R): {correlationCoefficient.toFixed(2)} 
          <span className="text-muted-foreground ml-2">
            ({correlationDescription} {correlationCoefficient >= 0 ? 'positive' : 'negative'} correlation)
          </span>
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="index"
              type="number" 
              domain={[0, transformedData.length - 1]}
              ticks={xAxisTicks}
              tickFormatter={(index) => xAxisLabels[index] || ''}
              label={{ 
                value: 'Date',
                position: 'insideBottomRight',
                offset: -10,
                style: { 
                  fontSize: '12px',
                  fill: 'currentColor'
                }
              }}
            />
            <YAxis
              dataKey="pnl"
              name="P&L"
              tickFormatter={formatValue}
              label={{ 
                value: 'P&L',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
                style: { 
                  fontSize: '12px',
                  fill: 'currentColor',
                  textAnchor: 'middle'
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => value}
              wrapperStyle={{ paddingTop: "20px" }}
            />
            <Scatter
              name="Positive"
              data={positiveData}
              fill={getEmotionColor('positive')}
              onClick={handleDataPointClick}
              cursor="pointer"
            />
            <Scatter
              name="Neutral"
              data={neutralData}
              fill={getEmotionColor('neutral')}
              onClick={handleDataPointClick}
              cursor="pointer"
            />
            <Scatter
              name="Negative"
              data={negativeData}
              fill={getEmotionColor('negative')}
              onClick={handleDataPointClick}
              cursor="pointer"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
          <p>Your journal entries reveal a {correlationDescription} {correlationCoefficient >= 0 ? 'positive' : 'negative'} correlation (R={correlationCoefficient.toFixed(2)}) between emotional state and trading performance.</p>
          <p>Best Performance: When you maintained emotional stability, your best trading result was ${formatValue(bestPerformance)}.</p>
          <p>Worst Performance: On the other hand, trading during heightened emotional states resulted in a low of ${formatValue(worstPerformance)}.</p>
          <p>Focus on cultivating emotional resilience to consistently achieve better outcomes. Remember, balance is your edge!</p>
        </div>
      </div>
    </Card>
  );
};
