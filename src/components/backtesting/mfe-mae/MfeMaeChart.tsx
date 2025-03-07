
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/types/trade";
import { StatsCards } from "./components/StatsCards";
import { MfeMaeBarChart } from "./components/MfeMaeBarChart";
import { AiRecommendations } from "./components/AiRecommendations";
import { processTrade } from "./utils/tradeCalculations";
import { ChartData, Stats } from "./types";

export function MfeMaeChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [stats, setStats] = useState<Stats>({
    tradesHitTp: 0,
    tradesHitSl: 0,
    avgUpdrawWinner: 0,
    avgUpdrawLoser: 0,
    avgDrawdownWinner: 0,
    avgDrawdownLoser: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      if (!entries) return;

      const processedData: ChartData[] = [];
      
      entries.forEach(entry => {
        const trades = entry.trades as Trade[];
        if (!trades) return;
        
        trades.forEach(trade => {
          const processedTrade = processTrade(trade);
          if (processedTrade) {
            processedData.push(processedTrade);
          }
        });
      });

      setData(processedData);

      // Calculate statistics
      const totalTrades = processedData.length;
      if (totalTrades === 0) return;

      // Count trades that hit TP (100% updraw)
      const tradesHitTp = processedData.filter(trade => trade.mfeRelativeToTp >= 100).length;
      const tradesHitTpPercentage = (tradesHitTp / totalTrades) * 100;

      // Count trades that hit SL (100% drawdown)
      const tradesHitSl = processedData.filter(trade => Math.abs(trade.maeRelativeToSl) >= 100).length;
      const tradesHitSlPercentage = (tradesHitSl / totalTrades) * 100;

      // Calculate sum of updraw values
      const sumUpdraw = processedData.reduce((sum, trade) => {
        return sum + trade.mfeRelativeToTp;
      }, 0);

      // Calculate MFE for losing trades (trades that hit stop loss)
      const losingTrades = processedData.filter(trade => Math.abs(trade.maeRelativeToSl) >= 100);
      const avgMfeLoser = losingTrades.length > 0
        ? losingTrades.reduce((sum, trade) => sum + trade.mfeRelativeToTp, 0) / losingTrades.length
        : 0;

      // Calculate sum of drawdown values for losing trades
      const sumDrawdown = processedData.reduce((sum, trade) => {
        return sum + Math.abs(trade.maeRelativeToSl);
      }, 0);

      // Step 1 & 2: Identify winning trades based on drawdown and profitability
      const winningTrades = processedData.filter(trade => {
        const hasNotHitStopLoss = Math.abs(trade.maeRelativeToSl) < 100;
        const isProfitable = trade.rMultiple && trade.rMultiple > 0;
        return hasNotHitStopLoss && isProfitable;
      });
      
      // Step 3 & 4: Calculate average MAE for winning trades
      const avgMaeWinner = winningTrades.length > 0
        ? winningTrades.reduce((sum, trade) => sum + Math.abs(trade.maeRelativeToSl), 0) / winningTrades.length
        : 0;

      setStats({
        tradesHitTp: tradesHitTpPercentage,
        tradesHitSl: tradesHitSlPercentage,
        avgUpdrawWinner: sumUpdraw / totalTrades,
        avgUpdrawLoser: avgMfeLoser,
        avgDrawdownWinner: avgMaeWinner,
        avgDrawdownLoser: sumDrawdown / totalTrades,
      });
    };

    fetchTrades();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="h-[600px] w-full">
          <MfeMaeBarChart data={data} />
        </div>
      </Card>
      <StatsCards stats={stats} />
      <AiRecommendations stats={stats} />
    </div>
  );
}
