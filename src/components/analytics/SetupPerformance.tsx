
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
  Cell,
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
  averageRiskReward: number;
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
            <span className="text-muted-foreground">Average R:R:</span>
            <span className="font-medium">{data.averageRiskReward.toFixed(2)}</span>
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
           typeof trade.pnl === 'number' ? trade.pnl : 0,
      // Calculate risk-reward ratio for each trade
      riskReward: calculateRiskReward(trade)
    }))
  );

  // Calculate risk-reward ratio for a trade
  function calculateRiskReward(trade: Trade): number {
    const entryPrice = Number(trade.entryPrice) || 0;
    const stopLoss = Number(trade.stopLoss) || 0;
    const takeProfit = Number(trade.takeProfit) || 0;
    
    if (!entryPrice || !stopLoss || !takeProfit) {
      return 0;
    }
    
    let risk, reward;
    
    if (trade.direction === 'buy') {
      risk = Math.abs(entryPrice - stopLoss);
      reward = Math.abs(takeProfit - entryPrice);
    } else {
      risk = Math.abs(stopLoss - entryPrice);
      reward = Math.abs(entryPrice - takeProfit);
    }
    
    return risk > 0 ? reward / risk : 0;
  }

  // Group trades by setup
  const setupMap = new Map<string, any[]>();
  
  allTrades.forEach(trade => {
    const setup = trade.setup || 'Undefined';
    if (!setupMap.has(setup)) {
      setupMap.set(setup, []);
    }
    setupMap.get(setup)?.push(trade);
  });

  // Calculate statistics for each setup
  const setupStats: SetupStats[] = Array.from(setupMap.entries()).map(([setup, trades]) => {
    // Ensure all pnl values are numbers
    const totalPnl = trades.reduce((sum, trade) => {
      const tradePnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                      typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + tradePnl;
    }, 0);
    
    // Count wins and losses based on numeric pnl values
    const winCount = trades.filter(trade => {
      const tradePnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                      typeof trade.pnl === 'number' ? trade.pnl : 0;
      return tradePnl > 0;
    }).length;
    
    const lossCount = trades.filter(trade => {
      const tradePnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                      typeof trade.pnl === 'number' ? trade.pnl : 0;
      return tradePnl < 0;
    }).length;
    
    const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;
    const averagePnl = trades.length > 0 ? totalPnl / trades.length : 0;
    
    // Calculate average risk-reward ratio
    const validRrTrades = trades.filter(t => t.riskReward > 0);
    const averageRiskReward = validRrTrades.length > 0
      ? validRrTrades.reduce((sum, t) => sum + t.riskReward, 0) / validRrTrades.length
      : 0;

    return {
      name: setup,
      totalPnl,
      winCount,
      lossCount,
      winRate,
      averagePnl,
      tradeCount: trades.length,
      averageRiskReward
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

  // Define color based on profitability
  const getBarColor = (value: number) => {
    if (value > 1000) return '#22c55e'; // Strong green for very profitable
    if (value > 0) return '#4ade80';    // Light green for profitable
    if (value > -500) return '#ef4444';  // Light red for small losses
    return '#dc2626';                    // Strong red for big losses
  };

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
            <BarChart data={sortedSetupStats} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name"
                angle={0}
                textAnchor="middle"
                height={60}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${formatCurrency(value)}`}
                domain={pnlDomain}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'transparent' }}
              />
              <Bar 
                dataKey="totalPnl" 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.9}
              >
                {sortedSetupStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.totalPnl)} />
                ))}
              </Bar>
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
        <div className="space-y-2 bg-accent/10 p-3 md:p-4 rounded-lg mt-8">
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
