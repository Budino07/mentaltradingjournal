
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
              className="p-1.5 h-10 w-10 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src="/lovable-uploads/3de77a29-8ca1-4638-8f34-18f3ecc1a113.png"
                alt="Brain Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none">
            <p>Mental Insights</p>
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
