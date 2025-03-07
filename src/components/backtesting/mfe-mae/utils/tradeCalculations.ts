import { Trade } from "@/types/trade";

export const calculateMaeRelativeToSl = (
  entryPrice: number,
  stopLoss: number,
  highestPrice: number,
  lowestPrice: number,
  isLong: boolean
): number => {
  // Check if the trade hit stop loss
  const hitStopLoss = isLong 
    ? lowestPrice <= stopLoss
    : highestPrice >= stopLoss;
  
  // If stop loss was hit, return exactly -100%
  if (hitStopLoss) {
    return -100;
  }
  
  // Otherwise calculate the actual percentage
  const maeRelativeToSl = isLong 
    ? ((lowestPrice - entryPrice) / (stopLoss - entryPrice)) * 100
    : ((highestPrice - entryPrice) / (stopLoss - entryPrice)) * 100;
  
  return -Math.abs(maeRelativeToSl);
};

export const calculateMfeRelativeToTp = (
  entryPrice: number,
  takeProfit: number,
  highestPrice: number,
  lowestPrice: number,
  isLongForTp: boolean
): number => {
  const mfeValue = isLongForTp 
    ? ((highestPrice - entryPrice) / (takeProfit - entryPrice)) * 100
    : ((entryPrice - lowestPrice) / (entryPrice - takeProfit)) * 100;

  console.log('MFE Calculation:', {
    entryPrice,
    takeProfit,
    highestPrice,
    lowestPrice,
    isLongForTp,
    result: mfeValue
  });

  return mfeValue;
};

export const calculateCapturedMove = (
  entryPrice: number,
  exitPrice: number,
  highestPrice: number,
  lowestPrice: number,
  isLong: boolean
): number => {
  if (isLong) {
    const totalMove = highestPrice - entryPrice;
    const capturedMove = exitPrice - entryPrice;
    
    // If no favorable move occurred or the move was against the position
    if (totalMove <= 0) {
      return Math.max(-100, (capturedMove / Math.abs(entryPrice - lowestPrice)) * 100);
    }
    
    return Math.min(100, Math.max(-100, (capturedMove / totalMove) * 100));
  } else {
    const totalMove = entryPrice - lowestPrice;
    const capturedMove = entryPrice - exitPrice;
    
    // If no favorable move occurred or the move was against the position
    if (totalMove <= 0) {
      return Math.max(-100, (capturedMove / Math.abs(entryPrice - highestPrice)) * 100);
    }
    
    return Math.min(100, Math.max(-100, (capturedMove / totalMove) * 100));
  }
};

export const calculateRMultiple = (
  entryPrice: number,
  takeProfit: number,
  stopLoss: number
): number => {
  return Math.abs(entryPrice - takeProfit) / Math.abs(entryPrice - stopLoss);
};

export const processTrade = (trade: Trade) => {
  if (
    !trade.highestPrice ||
    !trade.lowestPrice ||
    !trade.entryPrice ||
    !trade.takeProfit ||
    !trade.stopLoss ||
    !trade.exitPrice ||
    !trade.id
  ) {
    return null;
  }

  const entryPrice = Number(trade.entryPrice);
  const exitPrice = Number(trade.exitPrice);
  const highestPrice = Number(trade.highestPrice);
  const lowestPrice = Number(trade.lowestPrice);
  const takeProfit = Number(trade.takeProfit);
  const stopLoss = Number(trade.stopLoss);
  
  console.log('Processing trade:', {
    id: trade.id,
    instrument: trade.instrument,
    entryPrice,
    exitPrice,
    highestPrice,
    lowestPrice,
    takeProfit,
    stopLoss
  });
  
  const isLong = stopLoss < entryPrice;
  const isLongForTp = takeProfit > entryPrice;

  console.log('Trade direction:', {
    isLong,
    isLongForTp,
    instrument: trade.instrument
  });

  const maeRelativeToSl = calculateMaeRelativeToSl(
    entryPrice,
    stopLoss,
    highestPrice,
    lowestPrice,
    isLong
  );

  const mfeRelativeToTp = calculateMfeRelativeToTp(
    entryPrice,
    takeProfit,
    highestPrice,
    lowestPrice,
    isLongForTp
  );

  const capturedMove = calculateCapturedMove(
    entryPrice,
    exitPrice,
    highestPrice,
    lowestPrice,
    isLong
  );

  const rMultiple = calculateRMultiple(entryPrice, takeProfit, stopLoss);

  return {
    id: trade.id,
    mfeRelativeToTp,
    maeRelativeToSl,
    instrument: trade.instrument,
    rMultiple,
    capturedMove
  };
};
