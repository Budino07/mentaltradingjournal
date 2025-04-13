
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
import { toast } from "sonner";

export function MfeMaeChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      
      setLoading(true);
      setError(null);

      try {
        const { data: entries, error: fetchError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!entries || entries.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const processedData: ChartData[] = [];
        
        entries.forEach(entry => {
          const trades = entry.trades as Trade[];
          if (!trades || !Array.isArray(trades)) return;
          
          trades.forEach(trade => {
            // Check if trade has all required fields
            if (!trade.entryPrice || !trade.exitPrice || !trade.highestPrice || 
                !trade.lowestPrice || !trade.takeProfit || !trade.stopLoss) {
              return;
            }
            
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

        console.log(`Processed ${processedData.length} trades for MFE/MAE analysis`);
        setData(processedData);

        // Calculate statistics if we have trades
        if (processedData.length > 0) {
          calculateStats(processedData);
        }
      } catch (err) {
        console.error("Error fetching trades for MFE/MAE analysis:", err);
        setError("Failed to load trade data");
        toast.error("Failed to load MFE/MAE analysis data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  const calculateStats = (processedData: ChartData[]) => {
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
    const avgMfeWinner = winningTradesTp.length > 0 ? 
      winningTradesTp.reduce((sum, trade) => sum + trade.mfeRelativeToTp, 0) / winningTradesTp.length : 0;

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
    const avgMaeLoser = losingTrades.length > 0 ? 
      losingTrades.reduce((sum, trade) => sum + Math.abs(trade.maeRelativeToSl), 0) / losingTrades.length : 0;

    setStats({
      tradesHitTp: tradesHitTpPercentage,
      tradesHitSl: tradesHitSlPercentage,
      avgUpdrawWinner: avgMfeWinner,
      avgUpdrawLoser: avgMfeLoser,
      avgDrawdownWinner: avgMaeWinner,
      avgDrawdownLoser: avgMaeLoser,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="h-[600px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading MFE & MAE data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500">{error}</p>
                <p className="mt-2 text-muted-foreground">Please try again later.</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <h3 className="font-semibold text-lg mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  To see MFE & MAE analysis, add trades with entry price, exit price, highest price, lowest price, 
                  take profit, and stop loss values in your journal entries.
                </p>
              </div>
            </div>
          ) : (
            <MfeMaeBarChart data={data} />
          )}
        </div>
      </Card>
      
      {data.length > 0 && (
        <>
          <StatsCards stats={stats} />
          <AiRecommendations stats={stats} />
        </>
      )}
    </div>
  );
}
