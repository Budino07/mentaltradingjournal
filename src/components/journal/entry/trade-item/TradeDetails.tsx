
import { Trade } from "@/types/trade";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TradeDetailsProps {
  trade: Trade;
  formatDate: (date: string) => string;
}

export const TradeDetails = ({ trade, formatDate }: TradeDetailsProps) => {
  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Entry Details</h4>
          <div className="space-y-2">
            <p className="text-sm">Date: {formatDate(trade.entryDate || '')}</p>
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
            <div className="flex gap-4">
              {trade.forecastScreenshot && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => window.open(trade.forecastScreenshot, '_blank')}
                >
                  View Forecast <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {trade.resultUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => window.open(trade.resultUrl, '_blank')}
                >
                  View Result <ExternalLink className="h-4 w-4" />
                </Button>
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
