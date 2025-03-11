
import { Trade } from "@/types/trade";

interface TradeHeaderProps {
  trade: Trade;
}

export const TradeHeader = ({ trade }: TradeHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      <span className="font-medium">{trade.instrument}</span>
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
