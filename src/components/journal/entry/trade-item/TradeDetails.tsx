
import { Trade } from "@/types/trade";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TradeDetailsProps {
  trade: Trade;
  formatDate: (date: string) => string;
}

export const TradeDetails = ({ trade, formatDate }: TradeDetailsProps) => {
  const openImageInNewTab = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Entry Details</h4>
          <div className="space-y-2">
            <p className="text-sm">Date: {formatDate(trade.entryDate || '')}</p>
            <p className="text-sm">
              Direction: <span className={`font-medium ${trade.direction === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                {trade.direction === 'buy' ? 'Buy' : trade.direction === 'sell' ? 'Sell' : 'N/A'}
              </span>
            </p>
            <p className="text-sm">Price: {trade.entryPrice}</p>
            <p className="text-sm">Stop Loss: {trade.stopLoss}</p>
            <p className="text-sm">Take Profit: {trade.takeProfit}</p>
            <p className="text-sm">Highest Price: {trade.highestPrice}</p>
            <p className="text-sm">Lowest Price: {trade.lowestPrice}</p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Exit Details</h4>
          <div className="space-y-2">
            <p className="text-sm">Date: {formatDate(trade.exitDate || '')}</p>
            <p className="text-sm">Price: {trade.exitPrice}</p>
            <p className="text-sm">Quantity: {trade.quantity}</p>
          </div>
        </div>
      </div>

      {(trade.forecastScreenshot || trade.resultUrl) && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Trade Screenshots</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trade.forecastScreenshot && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Forecast</p>
                  <div 
                    onClick={() => openImageInNewTab(trade.forecastScreenshot)} 
                    className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                  >
                    <img 
                      src={trade.forecastScreenshot} 
                      alt="Trade forecast" 
                      className="rounded-md border max-h-64 object-contain w-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}
              {trade.resultUrl && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Result</p>
                  <div 
                    onClick={() => openImageInNewTab(trade.resultUrl)} 
                    className="cursor-pointer hover:opacity-90 transition-opacity relative group"
                  >
                    <img 
                      src={trade.resultUrl} 
                      alt="Trade result" 
                      className="rounded-md border max-h-64 object-contain w-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {trade.setup && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Setup</h4>
          <p className="text-sm">{trade.setup}</p>
        </div>
      )}
    </div>
  );
};
