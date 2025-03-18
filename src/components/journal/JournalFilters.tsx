
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TradeFormDialog } from "@/components/analytics/trade-form/TradeFormDialog";
import { Trade } from "@/types/trade";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const JournalFilters = () => {
  const navigate = useNavigate();
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const { user } = useAuth();

  const handleTradeSubmit = async (tradeData: Trade, isEdit: boolean) => {
    if (!user) return;

    try {
      // Convert trade data to JSON-compatible format
      const jsonTrade = {
        id: tradeData.id,
        instrument: tradeData.instrument || '',
        direction: tradeData.direction || '',
        entryDate: tradeData.entryDate || '',
        exitDate: tradeData.exitDate || '',
        entryPrice: tradeData.entryPrice?.toString() || '',
        exitPrice: tradeData.exitPrice?.toString() || '',
        stopLoss: tradeData.stopLoss?.toString() || '',
        takeProfit: tradeData.takeProfit?.toString() || '',
        quantity: tradeData.quantity?.toString() || '',
        fees: tradeData.fees?.toString() || '',
        setup: tradeData.setup || '',
        pnl: tradeData.pnl?.toString() || '',
        forecastScreenshot: tradeData.forecastScreenshot || '',
        resultScreenshot: tradeData.resultScreenshot || '',
      };

      if (isEdit) {
        // Handle edit case if needed
        return;
      }

      toast.success("Trade added successfully");
      setIsTradeFormOpen(false);

    } catch (error) {
      console.error('Error managing trade:', error);
      toast.error("Failed to save trade");
    }
  };

  return (
    <div className="flex gap-2 justify-start">
      <Button 
        variant="outline" 
        onClick={() => navigate('/journal-entry')}
      >
        Pre-Session
      </Button>

      <Button 
        variant="outline" 
        onClick={() => setIsTradeFormOpen(true)}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Trade
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => navigate('/journal-entry')}
      >
        Post-Session
      </Button>

      <TradeFormDialog
        open={isTradeFormOpen}
        onOpenChange={setIsTradeFormOpen}
        onSubmit={handleTradeSubmit}
      >
        <></>
      </TradeFormDialog>
    </div>
  );
};
