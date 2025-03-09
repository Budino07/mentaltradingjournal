export interface Trade {
  [key: string]: any;
  id?: string;
  instrument?: string;
  direction?: 'buy' | 'sell';
  entryDate?: string;
  exitDate?: string;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity?: number;
  fees?: number;
  setup?: string;
  pnl?: number | string;
  profit_loss?: number | string;
  forecastScreenshot?: string;
  resultScreenshot?: string;
  htfBias?: string;
}