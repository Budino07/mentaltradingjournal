
import { Button } from "@/components/ui/button";
import { Plus, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TradeFormDialog } from "@/components/analytics/trade-form/TradeFormDialog";
import { Trade } from "@/types/trade";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DailyInsightsDialog } from "./insights/DailyInsightsDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const JournalFilters = () => {
  const navigate = useNavigate();
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
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

  // Function to open insights dialog and dispatch an event
  const handleOpenInsights = () => {
    setIsInsightsOpen(true);
    // Dispatch an event that Journal.tsx can listen for
    const insightsEvent = new CustomEvent('journal-insights-open');
    window.dispatchEvent(insightsEvent);
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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              onClick={handleOpenInsights}
              className="p-2 h-10 w-10"
            >
              <img
                src="/lovable-uploads/6821d9c7-5948-4435-bdae-6e4fa72856ca.png"
                alt="Zella Logo"
                className="h-full w-full rounded-full"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insights</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TradeFormDialog
        open={isTradeFormOpen}
        onOpenChange={setIsTradeFormOpen}
        onSubmit={handleTradeSubmit}
      >
        <></>
      </TradeFormDialog>

      {/* The DailyInsightsDialog is handled by Journal.tsx */}
    </div>
  );
};
