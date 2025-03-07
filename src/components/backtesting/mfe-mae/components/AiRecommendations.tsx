
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
    <Card className="p-6 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 shadow-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-gradient-to-br from-primary-light to-primary p-3 rounded-full shadow-md">
          <LightbulbIcon className="h-7 w-7 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold text-gradient mb-2">AI Trading Insights</h3>
        
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
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Drawdown Analysis</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{drawdownRec.insight}</p>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary-dark dark:text-primary-light">Recommendation:</span> {drawdownRec.recommendation}
                </p>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Favorable Movement Analysis</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{favorableRec.insight}</p>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary-dark dark:text-primary-light">Recommendation:</span> {favorableRec.recommendation}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-100/70 to-purple-100/70 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-accent/20 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-dark">
                      <path d="M12 9v4"></path><path d="M12 17h.01"></path><circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-dark dark:text-accent">Example:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{drawdownRec.example}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-dark dark:text-primary-light">Next Step:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{drawdownRec.nextStep}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
