
import { Trade } from "@/types/trade";
import { TrendingDown, TrendingUp } from "lucide-react";

interface TradeHeaderProps {
  trade: Trade;
}

export const TradeHeader = ({ trade }: TradeHeaderProps) => {
  const pnl = parseFloat(String(trade.pnl || 0));
  const isProfitable = pnl >= 0;
  
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          trade.direction === 'buy' 
            ? 'bg-green-100 text-green-600' 
            : trade.direction === 'sell'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600'
        }`}>
          {trade.direction === 'buy' 
            ? <TrendingUp className="w-4 h-4" /> 
            : <TrendingDown className="w-4 h-4" />
          }
        </div>
        <div className="truncate">
          <h3 className="font-medium text-sm">
            {trade.instrument || "Unknown"}{' '}
            <span className="text-xs font-normal text-white">
              ({trade.direction === 'buy' ? 'Long' : 'Short'})
            </span>
          </h3>
          {trade.setup && (
            <p className="text-xs text-muted-foreground truncate">{trade.setup}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isProfitable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isProfitable ? '+' : ''}{pnl.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
