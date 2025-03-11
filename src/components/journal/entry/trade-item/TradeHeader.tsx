
import { Trade } from "@/types/trade";

interface TradeHeaderProps {
  trade: Trade;
}

export const TradeHeader = ({ trade }: TradeHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">{trade.instrument}</span>
        <span className={`text-sm ${
          trade.direction?.toLowerCase() === 'buy' ? 'text-green-500' : 
          trade.direction?.toLowerCase() === 'sell' ? 'text-red-500' : ''
        }`}>
          {trade.direction ? trade.direction.toUpperCase() : ''}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-medium ${
          Number(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {Number(trade.pnl) >= 0 ? '+' : '-'}${Math.abs(Number(trade.pnl)).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
