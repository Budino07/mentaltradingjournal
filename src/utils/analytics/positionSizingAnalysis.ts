
interface PositionSizeAnalysis {
  isWithinRiskLimit: boolean;
  actualRiskPercentage: number;
  recommendedLotSize: number;
  riskAmount: number;
}

export const calculatePositionRisk = (
  lotSize: number,
  stopLossPips: number,
  accountBalance: number,
  instrument: string
): PositionSizeAnalysis => {
  // Standard pip values for major currency pairs
  const pipValues: { [key: string]: number } = {
    'EUR/USD': 10,
    'GBP/USD': 10,
    'USD/JPY': 9.34,
    'USD/CHF': 10,
    'USD/CAD': 10,
    'AUD/USD': 10,
    'NZD/USD': 10,
  };

  // Get pip value for the instrument or default to 10
  const pipValue = pipValues[instrument] || 10;

  // Calculate risk amount
  const riskAmount = lotSize * stopLossPips * pipValue;
  
  // Calculate actual risk percentage
  const actualRiskPercentage = (riskAmount / accountBalance) * 100;

  // Calculate recommended lot size for 1% risk
  const targetRiskAmount = accountBalance * 0.01; // 1% of account
  const recommendedLotSize = Number((targetRiskAmount / (stopLossPips * pipValue)).toFixed(2));

  return {
    isWithinRiskLimit: actualRiskPercentage <= 1,
    actualRiskPercentage: Number(actualRiskPercentage.toFixed(2)),
    recommendedLotSize,
    riskAmount
  };
};

export const analyzeRiskTolerance = (trades: Array<any>): number => {
  let riskScore = 50; // Base score

  if (!trades || trades.length === 0) return riskScore;

  const riskAnalyses = trades.map(trade => {
    if (!trade.stopLoss || !trade.quantity || !trade.entryPrice) {
      return null;
    }

    const stopLossPips = Math.abs(trade.entryPrice - trade.stopLoss) * 10000;
    return calculatePositionRisk(
      trade.quantity,
      stopLossPips,
      trade.accountBalance || 10000, // Default to 10000 if not provided
      trade.instrument || 'EUR/USD'
    );
  }).filter(Boolean);

  if (riskAnalyses.length === 0) return riskScore;

  // Analyze risk patterns
  const averageRiskPercentage = riskAnalyses.reduce(
    (sum, analysis) => sum + analysis.actualRiskPercentage, 
    0
  ) / riskAnalyses.length;

  // Adjust score based on average risk
  if (averageRiskPercentage <= 1) {
    riskScore -= 10; // More conservative
  } else if (averageRiskPercentage > 1 && averageRiskPercentage <= 2) {
    riskScore += 10; // Moderate risk
  } else if (averageRiskPercentage > 2) {
    riskScore += 20; // High risk tolerance
  }

  // Consider consistency in position sizing
  const riskPercentages = riskAnalyses.map(a => a.actualRiskPercentage);
  const riskVariance = Math.variance(riskPercentages);
  
  if (riskVariance > 2) {
    riskScore += 15; // Inconsistent position sizing indicates higher risk tolerance
  }

  return Math.min(100, Math.max(0, riskScore));
};

