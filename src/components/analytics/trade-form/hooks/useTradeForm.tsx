
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/types/trade";
import { toast } from "sonner";

interface UseTradeFormProps {
  editTrade?: Trade;
  onSubmit: (tradeData: Trade, isEdit: boolean) => void;
  onOpenChange: (open: boolean) => void;
}

export const useTradeForm = ({ editTrade, onSubmit, onOpenChange }: UseTradeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const tradeData = {
        entryDate: formData.get("entryDate") as string,
        instrument: formData.get("instrument") as string,
        setup: formData.get("setup") as string,
        direction: formData.get("direction") as string,
        entryPrice: parseFloat(formData.get("entryPrice") as string),
        exitPrice: parseFloat(formData.get("exitPrice") as string),
        quantity: parseFloat(formData.get("quantity") as string),
        stopLoss: parseFloat(formData.get("stopLoss") as string),
        takeProfit: parseFloat(formData.get("takeProfit") as string),
        pnl: parseFloat(formData.get("pnl") as string),
        exitDate: formData.get("exitDate") as string,
        forecastScreenshot: formData.get("forecastScreenshot") as string,
        resultUrl: formData.get("resultUrl") as string,
        highestPrice: parseFloat(formData.get("highestPrice") as string),
        lowestPrice: parseFloat(formData.get("lowestPrice") as string)
      };

      if (editTrade) {
        // Get all journal entries for trades
        const { data: entries, error: fetchError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('session_type', 'trade');

        if (fetchError) throw fetchError;
        
        // Find the entry containing our trade
        const entry = entries?.find(entry => {
          const trades = entry.trades as any[];
          return trades?.some(trade => trade.id === editTrade.id);
        });

        if (!entry) throw new Error('Journal entry not found');

        const trades = entry.trades as any[];
        
        // Create a clean trade object for the update
        const updatedTradeObject = {
          id: editTrade.id,
          ...tradeData
        };

        // Update the trades array
        const updatedTrades = trades.map(trade => 
          trade.id === editTrade.id ? updatedTradeObject : trade
        );

        // Update the journal entry with the modified trades array
        const { error: updateError } = await supabase
          .from('journal_entries')
          .update({ trades: updatedTrades })
          .eq('id', entry.id);

        if (updateError) throw updateError;
      } else {
        // Create a new trade entry using the exit date as created_at
        const exitDate = new Date(tradeData.exitDate);
        const tradeObject = {
          id: crypto.randomUUID(),
          ...tradeData
        };

        const { error: tradeError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user?.id,
            notes: `Trade entry for ${tradeData.instrument}`,
            trades: [tradeObject],
            session_type: 'trade',
            emotion: 'neutral',    
            emotion_detail: 'neutral',
            created_at: exitDate.toISOString() // Set created_at to the trade's exit date
          });

        if (tradeError) throw tradeError;
      }

      await onSubmit(tradeData as Trade, !!editTrade);
      onOpenChange(false);

      // Create a full-screen loading overlay
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center';
      overlay.innerHTML = `
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p class="text-sm text-muted-foreground">Updating...</p>
        </div>
      `;
      document.body.appendChild(overlay);

      // Short delay to ensure the overlay is visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!editTrade) {
        // Store success message in sessionStorage before refresh
        sessionStorage.setItem('tradeSuccess', 'true');
        // Refresh the page
        window.location.reload();
      } else {
        toast.success("Trade updated successfully!");
      }
    } catch (error: any) {
      console.error(editTrade ? "Error updating trade:" : "Error saving trade:", error);
      toast.error(editTrade ? "Failed to update trade" : "Failed to save trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
};
