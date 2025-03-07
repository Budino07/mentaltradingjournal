
import { Card } from "@/components/ui/card";
import { LightbulbIcon } from "lucide-react";
import { Stats } from "../types";

interface AiRecommendationsProps {
  stats: Stats;
}

export function AiRecommendations({ stats }: AiRecommendationsProps) {
  // Calculate key ratios for insights
  const drawdownRatio = stats.avgDrawdownLoser / stats.avgDrawdownWinner;
  const favorableRatio = stats.avgUpdrawLoser / stats.avgUpdrawWinner;
  
  // Generate personalized recommendations based on the data
  const getDrawdownRecommendation = () => {
    if (drawdownRatio > 1.5) {
      return {
        insight: `Your losing trades experience nearly ${drawdownRatio.toFixed(1)}x more drawdown than your winners (${stats.avgDrawdownLoser.toFixed(2)}% vs. ${stats.avgDrawdownWinner.toFixed(2)}%). This suggests that your stop losses might be too loose, causing unnecessary losses.`,
        recommendation: `Try adjusting your stops closer to the average drawdown of your winning trades (around ${(stats.avgDrawdownWinner * 1.2).toFixed(0)}-${(stats.avgDrawdownWinner * 1.5).toFixed(0)}%) instead of letting them run to nearly ${stats.avgDrawdownLoser.toFixed(0)}%.`,
        example: `If you had tightened stops on past losing trades to ${(stats.avgDrawdownWinner * 1.3).toFixed(0)}% instead of ${stats.avgDrawdownLoser.toFixed(2)}%, you could have cut your average loss while maintaining a healthy Risk:Reward ratio.`,
        nextStep: `Review past trades where your stop was hit—could a tighter stop have improved overall performance without increasing the strike rate too much?`
      };
    } else if (drawdownRatio < 0.8) {
      return {
        insight: `Your winning trades experience more drawdown (${stats.avgDrawdownWinner.toFixed(2)}%) than your losing trades (${stats.avgDrawdownLoser.toFixed(2)}%). This suggests your stops might be too tight on losing trades.`,
        recommendation: `Consider giving your trades slightly more room to breathe. Your current stop placement may be cutting off potentially profitable trades too early.`,
        example: `Your winners endure ${stats.avgDrawdownWinner.toFixed(2)}% drawdown before becoming profitable, but you're cutting losses at only ${stats.avgDrawdownLoser.toFixed(2)}%.`,
        nextStep: `Identify a few past losing trades and analyze whether a slightly wider stop would have allowed them to turn into winners.`
      };
    } else {
      return {
        insight: `Your drawdown ratio between losing and winning trades is balanced (${drawdownRatio.toFixed(2)}x), which is generally healthy.`,
        recommendation: `Maintain your current stop loss strategy as the data suggests it's well-calibrated to your trading style.`,
        example: `Both your winners and losers experience proportional drawdowns, indicating disciplined trade management.`,
        nextStep: `Continue monitoring this ratio over time to ensure it stays balanced as market conditions change.`
      };
    }
  };

  const getFavorableExcursionRecommendation = () => {
    if (favorableRatio > 0.5) {
      return {
        insight: `Your losing trades reach ${stats.avgUpdrawLoser.toFixed(2)}% in your favor before turning into losses. This is ${(favorableRatio * 100).toFixed(0)}% of what your winners achieve (${stats.avgUpdrawWinner.toFixed(2)}%).`,
        recommendation: `Consider implementing partial profit-taking when trades move ${stats.avgUpdrawLoser.toFixed(0)}% in your favor to capture some gains on trades that might reverse.`,
        example: `If you had taken partial profits at ${stats.avgUpdrawLoser.toFixed(0)}%, you could have reduced your overall loss on trades that initially moved in your favor but later turned against you.`,
        nextStep: `Test a strategy where you exit 1/3 or 1/2 of your position when the trade reaches ${stats.avgUpdrawLoser.toFixed(0)}% favorable movement.`
      };
    } else if (stats.avgUpdrawLoser < 10 && stats.avgUpdrawWinner > 30) {
      return {
        insight: `Your losing trades show very little favorable movement (${stats.avgUpdrawLoser.toFixed(2)}%) compared to your winners (${stats.avgUpdrawWinner.toFixed(2)}%).`,
        recommendation: `This clear separation between winners and losers suggests your entry timing is excellent. Continue with your current entry strategy.`,
        example: `Winners immediately move in your favor (${stats.avgUpdrawWinner.toFixed(2)}%) while losers barely move your way (${stats.avgUpdrawLoser.toFixed(2)}%) before reversing.`,
        nextStep: `Focus on recognizing these early signs of trade direction to potentially cut losing trades even faster.`
      };
    } else {
      return {
        insight: `Your MFE profile shows winning trades reach ${stats.avgUpdrawWinner.toFixed(2)}% favorable movement, while losing trades reach ${stats.avgUpdrawLoser.toFixed(2)}%.`,
        recommendation: `The ${stats.avgUpdrawLoser.toFixed(0)}% mark appears to be a critical decision point for your trades. Consider using this as a reference for position management.`,
        example: `When a trade reaches ${stats.avgUpdrawLoser.toFixed(0)}% in your favor, it's at a turning point where it could become either a winner or a loser.`,
        nextStep: `Track what happens at the ${stats.avgUpdrawLoser.toFixed(0)}% favorable movement point in future trades to refine your management strategy.`
      };
    }
  };

  const drawdownRec = getDrawdownRecommendation();
  const favorableRec = getFavorableExcursionRecommendation();

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-4">
        <div className="bg-blue-500/10 p-2 rounded-full">
          <LightbulbIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">AI Trading Insights</h3>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-md">
                Your Avg. MAE Winner: {stats.avgDrawdownWinner.toFixed(2)}%
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-md">
                Your Avg. MAE Loser: {stats.avgDrawdownLoser.toFixed(2)}%
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-md">
                Your Avg. MFE Winner: {stats.avgUpdrawWinner.toFixed(2)}%
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-md">
                Your Avg. MFE Loser: {stats.avgUpdrawLoser.toFixed(2)}%
              </div>
            </div>
            
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Drawdown Analysis</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{drawdownRec.insight}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <span className="font-medium">💡 Recommendation:</span> {drawdownRec.recommendation}
            </p>
            
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Favorable Movement Analysis</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{favorableRec.insight}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <span className="font-medium">💡 Recommendation:</span> {favorableRec.recommendation}
            </p>
            
            <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-md mt-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">📌 Example:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{drawdownRec.example}</p>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mt-2">🔍 Next Step:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{drawdownRec.nextStep}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
