
import { Card } from "@/components/ui/card";
import { LightbulbIcon } from "lucide-react";
import { Session } from "./types";
import { processTrade } from "../mfe-mae/utils/tradeCalculations";
import { ChartData, Stats } from "../mfe-mae/types";

interface BlueprintMfeMaeInsightsProps {
  sessions: Session[];
}

export const BlueprintMfeMaeInsights = ({ sessions }: BlueprintMfeMaeInsightsProps) => {
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
  const calculateStats = (): Stats | null => {
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

  const stats = calculateStats();

  if (!stats) {
    return null;
  }

  // Generate analysis for MFE Winner
  const getMfeWinnerAnalysis = () => {
    if (stats.avgUpdrawWinner < 100) {
      return {
        insight: `On average, your winning trades reach ${stats.avgUpdrawWinner.toFixed(1)}% of your Take Profit (TP) target before reversing or closing.`,
        recommendation: `This suggests that your TP may be too ambitious, causing trades to fall short of full profit potential.`,
        nextStep: `Consider adjusting your TP to a more achievable level so that more trades can reach full TP, reducing the need for discretionary trade management and minimizing missed opportunities.`
      };
    } else {
      return {
        insight: `On average, your winning trades reach 100% of your Take Profit target.`,
        recommendation: `This indicates that your TP level is well-placed, allowing trades to fully realize their profit potential.`,
        nextStep: `However, consider reviewing whether your TP could be optimized further—either to capture even larger moves or lock in profits sooner based on market conditions.`
      };
    }
  };

  // Generate analysis for MFE Loser
  const getMfeLoserAnalysis = () => {
    if (stats.avgUpdrawLoser < 100) {
      return {
        insight: `On average, your losing trades reach ${stats.avgUpdrawLoser.toFixed(1)}% of your Take Profit target before reversing and stopping you out for a loss.`,
        recommendation: `This suggests there may be opportunities to adjust your stop-loss strategy—such as moving stops to breakeven—to reduce unnecessary losses and improve risk management.`,
        nextStep: `Consider implementing a rule to move your stop to breakeven when the trade reaches ${(stats.avgUpdrawLoser * 0.8).toFixed(0)}% of your take profit target.`
      };
    } else {
      return {
        insight: `Your losing trades achieve an average of ${stats.avgUpdrawLoser.toFixed(1)}% movement toward take profit.`,
        recommendation: `This unusually high percentage suggests some trades may be hitting take profit but still ending as losses, possibly due to re-entry or position management issues.`,
        nextStep: `Review your trade management practices to ensure you're not turning winners into losers through unnecessary adjustments after hitting take profit.`
      };
    }
  };

  // Generate analysis for MAE Winner
  const getMaeWinnerAnalysis = () => {
    return {
      insight: `On average, your winning trades move ${stats.avgDrawdownWinner.toFixed(1)}% toward your stop loss before reversing into a profit.`,
      recommendation: `This means only ${stats.avgDrawdownWinner.toFixed(1)}% of your stop loss is being utilized, suggesting that your stop could be tightened without negatively impacting your strike rate.`,
      nextStep: `By reducing your stop loss size, you can improve your Risk:Reward ratio, making your winners larger while maintaining your overall win rate.`
    };
  };

  // Generate analysis for MAE Loser
  const getMaeLoserAnalysis = () => {
    if (stats.avgDrawdownLoser < 100) {
      return {
        insight: `On average, your losing trades move ${stats.avgDrawdownLoser.toFixed(1)}% toward your stop loss before stopping you out.`,
        recommendation: `This suggests that you have manually exited some trades before they hit your stop, attempting to cut losses early. However, in doing so, you may have prematurely closed trades that could have recovered into winners.`,
        nextStep: `Since these trades had MAE < 100%, they were not destined to be full losers—but they became losses because of early exits.`
      };
    } else {
      return {
        insight: `Your losing trades hit 100% of your stop loss, indicating proper execution of your risk management plan.`,
        recommendation: `This shows discipline in letting your stop loss do its job of limiting risk, rather than making emotional decisions to exit early or move stops wider during trades.`,
        nextStep: `Continue maintaining this discipline, while possibly exploring whether your stop placement could be optimized based on the market's volatility profile.`
      };
    }
  };

  const mfeWinnerAnalysis = getMfeWinnerAnalysis();
  const mfeLoserAnalysis = getMfeLoserAnalysis();
  const maeWinnerAnalysis = getMaeWinnerAnalysis();
  const maeLoserAnalysis = getMaeLoserAnalysis();

  return (
    <Card className="p-6 mt-8 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 shadow-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-gradient-to-br from-primary-light to-primary p-3 rounded-full shadow-md">
          <LightbulbIcon className="h-7 w-7 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">AI Trading Insights</h3>
        
        <div className="w-full">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <div className="bg-white/60 dark:bg-indigo-900/40 text-primary-dark dark:text-indigo-300 text-xs px-2.5 py-1.5 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-800/50">
              <span className="font-medium">MFE Winner:</span> {stats.avgUpdrawWinner.toFixed(2)}%
            </div>
            <div className="bg-white/60 dark:bg-indigo-900/40 text-primary-dark dark:text-indigo-300 text-xs px-2.5 py-1.5 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-800/50">
              <span className="font-medium">MFE Loser:</span> {stats.avgUpdrawLoser.toFixed(2)}%
            </div>
            <div className="bg-white/60 dark:bg-indigo-900/40 text-primary-dark dark:text-indigo-300 text-xs px-2.5 py-1.5 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-800/50">
              <span className="font-medium">MAE Winner:</span> {stats.avgDrawdownWinner.toFixed(2)}%
            </div>
            <div className="bg-white/60 dark:bg-indigo-900/40 text-primary-dark dark:text-indigo-300 text-xs px-2.5 py-1.5 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-800/50">
              <span className="font-medium">MAE Loser:</span> {stats.avgDrawdownLoser.toFixed(2)}%
            </div>
          </div>
          
          <div className="space-y-4">
            {/* MFE Winner Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Favorable Excursion (Winners)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mfeWinnerAnalysis.insight}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mfeWinnerAnalysis.recommendation}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{mfeWinnerAnalysis.nextStep}</p>
            </div>
            
            {/* MFE Loser Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Favorable Excursion (Losers)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mfeLoserAnalysis.insight}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mfeLoserAnalysis.recommendation}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{mfeLoserAnalysis.nextStep}</p>
            </div>
            
            {/* MAE Winner Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Adverse Excursion (Winners)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maeWinnerAnalysis.insight}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maeWinnerAnalysis.recommendation}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{maeWinnerAnalysis.nextStep}</p>
            </div>
            
            {/* MAE Loser Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Adverse Excursion (Losers)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maeLoserAnalysis.insight}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maeLoserAnalysis.recommendation}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{maeLoserAnalysis.nextStep}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
