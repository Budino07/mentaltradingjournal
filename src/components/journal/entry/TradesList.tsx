import { Trade } from "@/types/trade";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { AddTradeDialog } from "@/components/analytics/AddTradeDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TradesListProps {
  trades: Trade[];
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const TradesList = ({ trades }: TradesListProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const handleEditClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsEditDialogOpen(true);
  };

  const handleTradeUpdate = async (updatedTrade: Trade) => {
    try {
      // Get all journal entries for the day of the trade
      const entryDate = new Date(updatedTrade.entryDate || new Date());
      const startOfDay = new Date(entryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(entryDate.setHours(23, 59, 59, 999));

      const { data: entries, error: fetchError } = await supabase
        .from('journal_entries')
        .select()
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (fetchError) throw fetchError;
      if (!entries || entries.length === 0) {
        throw new Error('Journal entry not found');
      }

      const entry = entries[0];
      const currentTrades = entry.trades || [];

      // Create a plain object for the updated trade
      const updatedTradeObject = {
        id: updatedTrade.id,
        instrument: updatedTrade.instrument,
        direction: updatedTrade.direction,
        entryDate: updatedTrade.entryDate,
        exitDate: updatedTrade.exitDate,
        entryPrice: updatedTrade.entryPrice,
        exitPrice: updatedTrade.exitPrice,
        stopLoss: updatedTrade.stopLoss,
        takeProfit: updatedTrade.takeProfit,
        quantity: updatedTrade.quantity,
        fees: updatedTrade.fees,
        setup: updatedTrade.setup,
        pnl: updatedTrade.pnl,
        forecastScreenshot: updatedTrade.forecastScreenshot,
        resultScreenshot: updatedTrade.resultScreenshot,
        htfBias: updatedTrade.htfBias
      };

      // Update the trades array
      const updatedTrades = currentTrades.map((trade: any) => 
        trade.id === updatedTrade.id ? updatedTradeObject : trade
      );

      // Update the journal entry
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({ trades: updatedTrades })
        .eq('id', entry.id);

      if (updateError) throw updateError;

      toast.success('Trade updated successfully');
      setIsEditDialogOpen(false);
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error('Failed to update trade');
    }
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {trades.map((trade, index) => (
          <AccordionItem key={trade.id || index} value={`trade-${index}`} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium">{trade.instrument}</span>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={trade.direction === 'buy' ? 'default' : 'destructive'}
                    className="px-3 py-1 rounded-md"
                  >
                    {trade.direction?.toUpperCase()}
                  </Badge>
                  <span className={`font-medium ${
                    Number(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Number(trade.pnl) >= 0 ? '+$' : '-$'}{Math.abs(Number(trade.pnl)).toLocaleString()}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-6 pt-2">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(trade)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" /> Edit Trade
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Entry Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm">Date: {formatDate(trade.entryDate || '')}</p>
                      <p className="text-sm">Price: {trade.entryPrice}</p>
                      <p className="text-sm">Stop Loss: {trade.stopLoss}</p>
                      <p className="text-sm">Take Profit: {trade.takeProfit}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Exit Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm">Date: {formatDate(trade.exitDate || '')}</p>
                      <p className="text-sm">Price: {trade.exitPrice}</p>
                      <p className="text-sm">Quantity: {trade.quantity}</p>
                      <p className="text-sm">Fees: {trade.fees}</p>
                    </div>
                  </div>
                </div>

                {(trade.forecastScreenshot || trade.resultScreenshot) && (
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
                        {trade.resultScreenshot && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => window.open(trade.resultScreenshot, '_blank')}
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddTradeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleTradeUpdate}
        editTrade={selectedTrade}
      />
    </>
  );
};
