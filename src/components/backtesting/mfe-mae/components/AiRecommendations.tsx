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

  // Get the original drawdown and favorable excursion recommendations for continuity
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
        
        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Trading Insights</h3>
        
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
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary-dark dark:text-primary-light">Insight:</span> {mfeWinnerAnalysis.recommendation}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-accent/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-accent-dark dark:text-accent">Action:</span> {mfeWinnerAnalysis.nextStep}
                </p>
              </div>
            </div>
            
            {/* MFE Loser Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Favorable Excursion (Losers)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mfeLoserAnalysis.insight}</p>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary-dark dark:text-primary-light">Insight:</span> {mfeLoserAnalysis.recommendation}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-accent/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-accent-dark dark:text-accent">Action:</span> {mfeLoserAnalysis.nextStep}
                </p>
              </div>
            </div>
            
            {/* MAE Winner Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Adverse Excursion (Winners)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maeWinnerAnalysis.insight}</p>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary-dark dark:text-primary-light">Insight:</span> {maeWinnerAnalysis.recommendation}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-accent/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-accent-dark dark:text-accent">Action:</span> {maeWinnerAnalysis.nextStep}
                </p>
              </div>
            </div>
            
            {/* MAE Loser Analysis */}
            <div className="bg-white/70 dark:bg-indigo-900/20 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/40">
              <h4 className="font-semibold text-primary-dark dark:text-indigo-300 mb-2">Maximum Adverse Excursion (Losers)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maeLoserAnalysis.insight}</p>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary-dark dark:text-primary-light">Insight:</span> {maeLoserAnalysis.recommendation}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="bg-accent/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-accent-dark dark:text-accent">Action:</span> {maeLoserAnalysis.nextStep}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-100/70 to-purple-100/70 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-dark dark:text-primary-light">Summary:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">The MFE/MAE analysis reveals opportunities to optimize your trade management by possibly adjusting your take profit targets and/or stop loss placement to better align with actual market behavior.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
