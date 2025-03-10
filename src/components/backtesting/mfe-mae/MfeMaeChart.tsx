
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
            // Add journal entry ID and entry date to the processed trade data
            processedData.push({
              ...processedTrade,
              journalEntryId: entry.id,
              entryDate: entry.created_at
            });
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

      // MFE for winner trades (those that hit take profit)
      const winningTradesTp = processedData.filter(trade => trade.mfeRelativeToTp >= 100);
      const avgMfeWinner = winningTradesTp.length > 0 ? 100 : 0;

      // Calculate MFE for losing trades (trades that hit stop loss)
      const losingTrades = processedData.filter(trade => Math.abs(trade.maeRelativeToSl) >= 100);
      const avgMfeLoser = losingTrades.length > 0
        ? losingTrades.reduce((sum, trade) => sum + trade.mfeRelativeToTp, 0) / losingTrades.length
        : 0;

      // Identify winning trades based on profitability
      const winningTrades = processedData.filter(trade => {
        const hasNotHitStopLoss = Math.abs(trade.maeRelativeToSl) < 100;
        const isProfitable = trade.rMultiple && trade.rMultiple > 0;
        return hasNotHitStopLoss && isProfitable;
      });
      
      // Calculate average MAE for winning trades
      const avgMaeWinner = winningTrades.length > 0
        ? winningTrades.reduce((sum, trade) => sum + Math.abs(trade.maeRelativeToSl), 0) / winningTrades.length
        : 0;

      // For losing trades, MAE should be exactly 100% since they hit stop loss
      const avgMaeLoser = tradesHitSl > 0 ? 100 : 0;

      setStats({
        tradesHitTp: tradesHitTpPercentage,
        tradesHitSl: tradesHitSlPercentage,
        avgUpdrawWinner: avgMfeWinner,
        avgUpdrawLoser: avgMfeLoser,
        avgDrawdownWinner: avgMaeWinner,
        avgDrawdownLoser: avgMaeLoser,
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
