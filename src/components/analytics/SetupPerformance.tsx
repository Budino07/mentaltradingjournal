
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Trade } from "@/types/analytics";

interface SetupStats {
  name: string;
  totalPnl: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  averagePnl: number;
  tradeCount: number;
}

const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
        <p className="font-medium text-sm text-foreground mb-2">
          {data.name}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Total P&L:</span>
            <span className={`font-medium ${data.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${formatCurrency(data.totalPnl)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Win Rate:</span>
            <span className="font-medium">{data.winRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Average P&L:</span>
            <span className={`font-medium ${data.averagePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${formatCurrency(data.averagePnl)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Trades:</span>
            <span className="font-medium">{data.tradeCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Wins / Losses:</span>
            <span className="font-medium">{data.winCount} / {data.lossCount}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SetupPerformance = () => {
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

  // Process trades to extract setup performance
  const allTrades = analytics.journalEntries.flatMap(entry => 
    (entry.trades || []).map(trade => ({
      ...trade,
      pnl: typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
           typeof trade.pnl === 'number' ? trade.pnl : 0
    }))
  );

  // Group trades by setup
  const setupMap = new Map<string, Trade[]>();
  
  allTrades.forEach(trade => {
    const setup = trade.setup || 'Undefined';
    if (!setupMap.has(setup)) {
      setupMap.set(setup, []);
    }
    setupMap.get(setup)?.push(trade);
  });

  // Calculate statistics for each setup
  const setupStats: SetupStats[] = Array.from(setupMap.entries()).map(([setup, trades]) => {
    const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winCount = trades.filter(trade => (trade.pnl || 0) > 0).length;
    const lossCount = trades.filter(trade => (trade.pnl || 0) < 0).length;
    const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
    const averagePnl = trades.length > 0 ? totalPnl / trades.length : 0;

    return {
      name: setup,
      totalPnl,
      winCount,
      lossCount,
      winRate,
      averagePnl,
      tradeCount: trades.length
    };
  });

  // Sort setups by total PnL
  const sortedSetupStats = setupStats
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .filter(setup => setup.tradeCount > 0);

  // Calculate max and min PnL for better chart scaling
  const maxPnl = Math.max(...sortedSetupStats.map(setup => setup.totalPnl));
  const minPnl = Math.min(...sortedSetupStats.map(setup => setup.totalPnl));
  const pnlDomain = [
    minPnl < 0 ? minPnl * 1.1 : 0, 
    maxPnl > 0 ? maxPnl * 1.1 : 100
  ];

  // Get the most and least profitable setups
  const mostProfitableSetup = sortedSetupStats.length > 0 ? sortedSetupStats[0] : null;
  const leastProfitableSetup = sortedSetupStats.length > 0 ? sortedSetupStats[sortedSetupStats.length - 1] : null;

  return (
    <Card className="p-4 md:p-6 space-y-4 col-span-2">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold">Setup Performance</h3>
        <p className="text-sm text-muted-foreground">
          Analysis of P&L performance by trading setup
        </p>
      </div>

      {sortedSetupStats.length > 0 ? (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedSetupStats} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${formatCurrency(value)}`}
                domain={pnlDomain}
                label={{ 
                  value: 'Total P&L',
                  angle: -90,
                  position: 'insideLeft',
                  style: { 
                    textAnchor: 'middle',
                    fontSize: '12px',
                    fill: 'currentColor'
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                name="P&L" 
                dataKey="totalPnl" 
                fill="var(--primary)" 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-center">
            No trade setup data available. Add trades with setup information to see performance analysis.
          </p>
        </div>
      )}

      {sortedSetupStats.length > 0 && (
        <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg">
          <h4 className="font-semibold text-sm md:text-base">AI Insight</h4>
          <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
            <p>
              {mostProfitableSetup && `Your most profitable setup is "${mostProfitableSetup.name}" with a total P&L of $${formatCurrency(mostProfitableSetup.totalPnl)} and a ${mostProfitableSetup.winRate.toFixed(1)}% win rate across ${mostProfitableSetup.tradeCount} trades.`}
            </p>
            <p>
              {leastProfitableSetup && leastProfitableSetup.totalPnl < 0 && `Your least profitable setup is "${leastProfitableSetup.name}" with a total loss of $${formatCurrency(Math.abs(leastProfitableSetup.totalPnl))} and a ${leastProfitableSetup.winRate.toFixed(1)}% win rate across ${leastProfitableSetup.tradeCount} trades.`}
            </p>
            <p>
              {sortedSetupStats.length > 1 ? 
                `Focus on the setups with higher win rates and average P&L to maximize your trading edge.` : 
                `Continue documenting your trades with setup information to gain more insights.`}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
