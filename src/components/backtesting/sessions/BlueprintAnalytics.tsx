import { Card } from "@/components/ui/card";
import { Session } from "./types";
import { AssetPairChart } from "@/components/analytics/asset-pair/AssetPairChart";
import { RiskRewardChart } from "@/components/analytics/risk-reward/RiskRewardChart";
import { EquityCurveChart } from "@/components/analytics/equity-curve/EquityCurveChart";
import { EquityMetrics } from "@/components/analytics/equity-curve/EquityMetrics";
import { BalanceSelector } from "@/components/analytics/equity-curve/BalanceSelector";
import { useState } from "react";
import { analyzeTradeDurations } from "@/utils/analytics/tradeDurationAnalysis";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PerformanceInsight } from "@/components/analytics/performance/PerformanceInsight";
import { WinLossRatioBP } from "@/components/analytics/WinLossRatioBP";
import { MfeMaeBarChart } from "@/components/backtesting/mfe-mae/components/MfeMaeBarChart";
import { StatsCards } from "@/components/backtesting/mfe-mae/components/StatsCards";
import { processTrade } from "@/components/backtesting/mfe-mae/utils/tradeCalculations";
import { ChartData } from "@/components/backtesting/mfe-mae/types";

interface BlueprintAnalyticsProps {
  sessions: Session[];
}

export const BlueprintAnalytics = ({ sessions }: BlueprintAnalyticsProps) => {
  const [selectedBalance, setSelectedBalance] = useState(10000);

  // Process sessions for asset pair performance
  const assetPairData = sessions.reduce((acc, session) => {
    const instrument = session.instrument || 'Unknown';
    if (!acc[instrument]) {
      acc[instrument] = { profit: 0, loss: 0, net: 0 };
    }
    const pnl = session.pnl || 0;
    if (pnl > 0) {
      acc[instrument].profit += pnl;
    } else {
      acc[instrument].loss += Math.abs(pnl);
    }
    acc[instrument].net = acc[instrument].profit - acc[instrument].loss;
    return acc;
  }, {} as Record<string, { profit: number; loss: number; net: number; }>);

  const chartData = Object.entries(assetPairData).map(([pair, stats]) => ({
    pair,
    profit: stats.profit,
    loss: -Math.abs(stats.loss),
    net: stats.net,
  }));

  // Process sessions for risk/reward analysis
  const riskRewardData = sessions
    .filter(session => session.entryPrice && session.stopLoss && session.takeProfit)
    .map(session => {
      const entryPrice = Number(session.entryPrice);
      const stopLoss = Number(session.stopLoss);
      const takeProfit = Number(session.takeProfit);
      const date = new Date(session.exitDate);
      
      let risk = 0;
      let reward = 0;
      
      if (session.direction === 'buy') {
        risk = Math.abs(entryPrice - stopLoss);
        reward = Math.abs(takeProfit - entryPrice);
      } else {
        risk = Math.abs(stopLoss - entryPrice);
        reward = Math.abs(entryPrice - takeProfit);
      }

      return {
        date,
        riskRewardRatio: risk > 0 ? reward / risk : 0,
        isSignificant: (reward / risk) > 3 || (reward / risk) < 0.5,
        pnl: session.pnl || 0,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Process sessions for equity curve
  const equityCurveData = sessions
    .sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime())
    .reduce((acc, session, index) => {
      const date = new Date(session.exitDate).toLocaleDateString();
      const previousBalance = index > 0 ? acc[index - 1].balance : selectedBalance;
      const dailyPnL = session.pnl || 0;
      
      acc.push({
        date,
        balance: previousBalance + dailyPnL,
        dailyPnL,
      });
      
      return acc;
    }, [] as Array<{ date: string; balance: number; dailyPnL: number; }>);

  const currentBalance = equityCurveData.length > 0 
    ? equityCurveData[equityCurveData.length - 1].balance 
    : selectedBalance;
  const totalReturn = ((currentBalance - selectedBalance) / selectedBalance) * 100;

  // Calculate max drawdown percentage
  const maxDrawdownPercentage = equityCurveData.reduce((maxDD, point, index) => {
    const peak = Math.max(...equityCurveData.slice(0, index + 1).map(p => p.balance));
    const drawdown = ((peak - point.balance) / peak) * 100;
    return Math.max(maxDD, drawdown);
  }, 0);

  // Process sessions for trade duration analysis
  const tradeDurationData = sessions.map(session => ({
    entryDate: session.entryDate,
    exitDate: session.exitDate,
    pnl: session.pnl
  }));

  const durationData = analyzeTradeDurations(tradeDurationData);

  // Group trades by duration category and calculate stats
  const durationRanges = [
    { min: 0, max: 0.5, label: "< 30 min" },
    { min: 0.5, max: 1, label: "30-60 min" },
    { min: 1, max: 3, label: "1-3 hrs" },
    { min: 3, max: 6, label: "3-6 hrs" },
    { min: 6, max: 9, label: "6-9 hrs" },
    { min: 9, max: 12, label: "9-12 hrs" },
    { min: 12, max: 24, label: "12-24 hrs" },
    { min: 24, max: Infinity, label: "> 24 hrs" },
  ];

  const durationStats = durationData.reduce((acc, trade) => {
    const duration = trade.duration; // Now in hours
    const range = durationRanges.find(r => 
      duration > r.min && duration <= r.max
    );
    
    if (range) {
      if (!acc[range.label]) {
        acc[range.label] = { count: 0, wins: 0, totalPnL: 0 };
      }
      acc[range.label].count += 1;
      if (trade.pnl > 0) acc[range.label].wins += 1;
      acc[range.label].totalPnL += trade.pnl;
    }
    return acc;
  }, {} as Record<string, { count: number; wins: number; totalPnL: number; }>);

  const durationChartData = Object.entries(durationStats)
    .map(([category, stats]) => ({
      category,
      winRate: (stats.wins / stats.count) * 100,
      count: stats.count,
      avgPnL: stats.totalPnL / stats.count
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => {
      const indexA = durationRanges.findIndex(r => r.label === a.category);
      const indexB = durationRanges.findIndex(r => r.label === b.category);
      return indexA - indexB;
    });

  // Find the best performing duration category
  const bestDuration = durationChartData.reduce((prev, current) => 
    current.winRate > prev.winRate && current.count >= 5 ? current : prev, 
    durationChartData[0]
  );

  const getTradeDurationInsight = () => {
    if (!bestDuration) {
      return {
        mainInsight: "Not enough trade duration data available.",
        recommendedAction: "Add more trades to see duration-based insights."
      };
    }

    return {
      mainInsight: `Your ${bestDuration.category} trades have a ${bestDuration.winRate.toFixed(1)}% win rate.`,
      recommendedAction: "Consider focusing more on trades within this duration range for optimal results."
    };
  };

  const durationInsight = getTradeDurationInsight();

  // Process sessions for MFE & MAE analysis
  const processedMfeMaeData = sessions
    .map(session => ({
      id: session.id,
      entryPrice: session.entryPrice,
      exitPrice: session.exitPrice,
      highestPrice: session.highestPrice,
      lowestPrice: session.lowestPrice,
      takeProfit: session.takeProfit,
      stopLoss: session.stopLoss,
      instrument: session.instrument,
    }))
    .map(processTrade)
    .filter((trade): trade is ChartData => trade !== null);

  // Calculate MFE & MAE statistics
  const calculateStats = () => {
    const trades = processedMfeMaeData;
    const totalTrades = trades.length;
    if (totalTrades === 0) return null;

    const tradesHitTp = (trades.filter(trade => trade.mfeRelativeToTp >= 100).length / totalTrades) * 100;
    const tradesHitSl = (trades.filter(trade => Math.abs(trade.maeRelativeToSl) >= 100).length / totalTrades) * 100;

    const winningTrades = trades.filter(trade => trade.mfeRelativeToTp >= 100);
    const losingTrades = trades.filter(trade => Math.abs(trade.maeRelativeToSl) >= 100);

    return {
      tradesHitTp,
      tradesHitSl,
      avgUpdrawWinner: winningTrades.length > 0
        ? winningTrades.reduce((sum, trade) => sum + trade.mfeRelativeToTp, 0) / winningTrades.length
        : 0,
      avgUpdrawLoser: losingTrades.length > 0
        ? losingTrades.reduce((sum, trade) => sum + trade.mfeRelativeToTp, 0) / losingTrades.length
        : 0,
      avgDrawdownWinner: winningTrades.length > 0
        ? winningTrades.reduce((sum, trade) => sum + Math.abs(trade.maeRelativeToSl), 0) / winningTrades.length
        : 0,
      avgDrawdownLoser: losingTrades.length > 0
        ? losingTrades.reduce((sum, trade) => sum + Math.abs(trade.maeRelativeToSl), 0) / losingTrades.length
        : 0,
    };
  };

  const mfeMaeStats = calculateStats();

  return (
    <div className="space-y-8 mt-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Analytics</h2>
        <EquityMetrics
          initialBalance={selectedBalance}
          currentBalance={currentBalance}
          totalReturn={totalReturn}
          maxDrawdown={maxDrawdownPercentage}
        />
      </div>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Equity Curve</h3>
            <BalanceSelector
              selectedBalance={selectedBalance}
              onBalanceChange={setSelectedBalance}
            />
          </div>
        </div>
        <div className="h-[400px]">
          <EquityCurveChart
            data={equityCurveData}
            initialBalance={selectedBalance}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Asset Pair Performance</h3>
          <div className="h-[300px] pr-4">
            <AssetPairChart data={chartData} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Trade Duration Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={durationChartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  domain={[0, 100]}
                  label={{
                    value: 'Win Rate',
                    angle: -90,
                    position: 'insideLeft',
                    style: { 
                      fontSize: '12px', 
                      textAnchor: 'middle',
                      fill: 'hsl(var(--foreground))'
                    },
                    dx: -20
                  }}
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip 
                  cursor={{ 
                    fill: 'hsl(var(--muted))',
                    opacity: 0.1 
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const value = payload[0].value as number;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3">
                        <p className="font-medium text-sm mb-2">{label}</p>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Win Rate:</span>
                            <span className="font-medium">
                              {value.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({payload[0].payload.count} trades)
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="winRate"
                  fill="hsl(var(--primary))"
                  name="Win Rate"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <PerformanceInsight 
              mainInsight={durationInsight.mainInsight}
              recommendedAction={durationInsight.recommendedAction}
            />
          </div>
        </Card>

        <WinLossRatioBP sessions={sessions} />
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Risk/Reward Analysis</h3>
        <RiskRewardChart data={riskRewardData} />
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">MFE & MAE Analysis</h3>
          <div className="h-[600px] w-full">
            <MfeMaeBarChart data={processedMfeMaeData} />
          </div>
        </Card>
        
        {mfeMaeStats && (
          <StatsCards stats={mfeMaeStats} />
        )}
      </div>
    </div>
  );
};
