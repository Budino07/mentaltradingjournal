
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useQuery } from "@tanstack/react-query";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
      <p className="font-medium text-sm text-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0].color || payload[0].fill }}
        />
        <span className="text-muted-foreground">Count:</span>
        <span className="font-medium text-foreground">{payload[0].value}</span>
      </div>
    </div>
  );
};

const formatToK = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(0)}K`;
  }
  return `${value < 0 ? '-' : ''}$${absValue}`;
};

const generateDynamicRanges = (trades: any[]) => {
  const pnlValues = trades.map(trade => Number(trade.pnl));
  const validPnlValues = pnlValues.filter(pnl => !isNaN(pnl) && isFinite(pnl));
  
  if (validPnlValues.length === 0) {
    return [];
  }

  const min = Math.min(...validPnlValues);
  const max = Math.max(...validPnlValues);

  // Handle case where all values are the same
  if (min === max) {
    return [{
      min: min - 1,
      max: max + 1,
      label: formatToK(min)
    }];
  }

  // Determine the optimal number of bins based on data spread
  const spread = max - min;
  const targetBinCount = spread > 10000 ? 6 : spread > 5000 ? 5 : 4;

  const binSize = Math.ceil(spread / targetBinCount);
  const ranges = [];

  // Create bins with round numbers
  const roundToPrettyNumber = (num: number) => {
    if (num === 0) return 0;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(num))));
    return Math.round(num / magnitude) * magnitude;
  };

  let currentMin = roundToPrettyNumber(min);
  const roundedMax = roundToPrettyNumber(max + binSize);

  while (currentMin < roundedMax) {
    const currentMax = Math.min(roundToPrettyNumber(currentMin + binSize), roundedMax);
    ranges.push({
      min: currentMin,
      max: currentMax,
      label: `${formatToK(currentMin)} to ${formatToK(currentMax)}`
    });
    currentMin = currentMax;
  }

  return ranges;
};

const formatRangeLabel = (range: { min: number; max: number; label: string }) => {
  if (range.min === -Infinity) return `< ${formatToK(range.max)}`;
  if (range.max === Infinity) return `> ${formatToK(range.min)}`;
  return range.label;
};

export const ProfitLossDistribution = () => {
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

  // Process trades from journal entries
  const allTrades = analytics.journalEntries.flatMap(entry => entry.trades || [])
    .filter(trade => trade && trade.pnl !== undefined && trade.pnl !== null);

  if (allTrades.length === 0) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Profit/Loss Distribution</h3>
          <p className="text-sm text-muted-foreground">No trade data available yet</p>
        </div>
      </Card>
    );
  }

  const ranges = generateDynamicRanges(allTrades);

  if (ranges.length === 0) {
    return (
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">Profit/Loss Distribution</h3>
          <p className="text-sm text-muted-foreground">Unable to generate valid P&L ranges from the available data</p>
        </div>
      </Card>
    );
  }

  const data = ranges.map(range => ({
    range: formatRangeLabel(range),
    count: allTrades.filter(trade => {
      const pnl = Number(trade.pnl);
      return pnl >= range.min && pnl < range.max;
    }).length,
    min: range.min // Add min value to determine color
  }));

  // Calculate statistics for AI insight with initial value for reduce
  const totalTrades = allTrades.length;
  const mostFrequentBin = data.reduce((prev, current) => 
    (current.count > prev.count) ? current : prev, 
    { range: '', count: 0 }
  );
  const mostFrequentPercentage = totalTrades > 0 ? (mostFrequentBin.count / totalTrades) * 100 : 0;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Profit/Loss Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Distribution of trade outcomes across P&L ranges
        </p>
      </div>

      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              tickLine={{ stroke: 'currentColor' }}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              tickLine={{ stroke: 'currentColor' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'currentColor', opacity: 0.1 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.min < 0 ? '#FEC6A1' : '#6E59A5'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
        <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
        <p className="text-xs md:text-sm text-muted-foreground">
          {mostFrequentPercentage > 40
            ? `${mostFrequentPercentage.toFixed(1)}% of your trades fall within the ${mostFrequentBin.range} range, indicating a consistent pattern in your trade outcomes.`
            : "Your trade outcomes show a diverse distribution across different P&L ranges, suggesting varied market conditions or strategy adaptations."}
        </p>
      </div>
    </Card>
  );
};
