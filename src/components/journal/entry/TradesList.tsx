import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Trade } from "@/types/trade";
import { formatCurrency } from "../calendar/calendarUtils";
import { TradeFormDialog } from "@/components/analytics/trade-form/TradeFormDialog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TradesListProps {
  journalEntryId: string;
  trades: Trade[];
}

export const TradesList = ({ journalEntryId, trades }: TradesListProps) => {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const queryClient = useQueryClient();

  const handleEditClick = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeFormOpen(true);
  };

  const handleDeleteClick = (trade: Trade) => {
    setTradeToDelete(trade);
    setIsDeleteDialogOpen(true);
  };

  const handleTradeSubmit = async (tradeData: Trade, isEdit: boolean) => {
    try {
      if (isEdit && tradeData.id) {
        // Update existing trade
        const { error } = await supabase
          .from("trades")
          .update({
            instrument: tradeData.instrument,
            direction: tradeData.direction,
            entry_date: tradeData.entryDate,
            exit_date: tradeData.exitDate,
            entry_price: tradeData.entryPrice,
            exit_price: tradeData.exitPrice,
            stop_loss: tradeData.stopLoss,
            take_profit: tradeData.takeProfit,
            quantity: tradeData.quantity,
            fees: tradeData.fees,
            setup: tradeData.setup,
            pnl: tradeData.pnl,
            forecast_screenshot: tradeData.forecastScreenshot,
            result_screenshot: tradeData.resultScreenshot,
          })
          .eq("id", tradeData.id);

        if (error) throw error;
        toast.success("Trade updated successfully");
      } else {
        // Create new trade
        const { error } = await supabase.from("trades").insert({
          journal_entry_id: journalEntryId,
          instrument: tradeData.instrument,
          direction: tradeData.direction,
          entry_date: tradeData.entryDate,
          exit_date: tradeData.exitDate,
          entry_price: tradeData.entryPrice,
          exit_price: tradeData.exitPrice,
          stop_loss: tradeData.stopLoss,
          take_profit: tradeData.takeProfit,
          quantity: tradeData.quantity,
          fees: tradeData.fees,
          setup: tradeData.setup,
          pnl: tradeData.pnl,
          forecast_screenshot: tradeData.forecastScreenshot,
          result_screenshot: tradeData.resultScreenshot,
        });

        if (error) throw error;
        toast.success("Trade added successfully");
      }

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setIsTradeFormOpen(false);
      setEditingTrade(null);
    } catch (error) {
      console.error("Error saving trade:", error);
      toast.error("Failed to save trade");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tradeToDelete?.id) return;

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeToDelete.id);

      if (error) throw error;

      toast.success("Trade deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Failed to delete trade");
    } finally {
      setIsDeleteDialogOpen(false);
      setTradeToDelete(null);
    }
  };

  return (
    <div className="space-y-3">
      {trades.map((trade) => (
        <Card key={trade.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{trade.instrument}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      trade.direction === "buy"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {trade.direction?.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trade.setup}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(trade)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(trade)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              <div>
                <p className="text-xs text-muted-foreground">Entry</p>
                <p className="text-sm">
                  {trade.entryPrice
                    ? parseFloat(trade.entryPrice.toString()).toFixed(5)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exit</p>
                <p className="text-sm">
                  {trade.exitPrice
                    ? parseFloat(trade.exitPrice.toString()).toFixed(5)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stop Loss</p>
                <p className="text-sm">
                  {trade.stopLoss
                    ? parseFloat(trade.stopLoss.toString()).toFixed(5)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Take Profit</p>
                <p className="text-sm">
                  {trade.takeProfit
                    ? parseFloat(trade.takeProfit.toString()).toFixed(5)
                    : "-"}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted-foreground">P&L</p>
              <p
                className={`text-base font-semibold ${
                  trade.pnl && parseFloat(trade.pnl.toString()) > 0
                    ? "text-green-600 dark:text-green-400"
                    : trade.pnl && parseFloat(trade.pnl.toString()) < 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }`}
              >
                {trade.pnl ? formatCurrency(parseFloat(trade.pnl.toString())) : "-"}
              </p>
            </div>

            {(trade.forecastScreenshot || trade.resultScreenshot) && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                {trade.forecastScreenshot && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Forecast</p>
                    <img
                      src={trade.forecastScreenshot}
                      alt="Trade forecast"
                      className="rounded-md border w-full h-auto max-h-32 object-cover"
                    />
                  </div>
                )}
                {trade.resultScreenshot && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Result</p>
                    <img
                      src={trade.resultScreenshot}
                      alt="Trade result"
                      className="rounded-md border w-full h-auto max-h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <TradeFormDialog
        open={isTradeFormOpen}
        onOpenChange={setIsTradeFormOpen}
        onSubmit={handleTradeSubmit}
        editTrade={editingTrade}
      >
        <></>
      </TradeFormDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this trade. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
