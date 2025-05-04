
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/types/trade";
import { toast } from "sonner";
import { useTradingAccounts } from "@/contexts/TradingAccountsContext";

interface UseTradeFormProps {
  editTrade?: Trade;
  onSubmit: (tradeData: Trade, isEdit: boolean) => void;
  onOpenChange: (open: boolean) => void;
}

export const useTradeForm = ({ editTrade, onSubmit, onOpenChange }: UseTradeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { activeAccount } = useTradingAccounts();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Get setup value directly from form or fallback to original editTrade value
      let setup = formData.get("setup") as string;
      console.log("Setup from form:", setup); 
      console.log("Original setup:", editTrade?.setup);
      
      // If the setup is empty and we're editing a trade with a setup, preserve the original setup
      if ((!setup || setup.trim() === '') && editTrade?.setup) {
        setup = editTrade.setup;
        console.log("Using original setup:", setup);
      }
      
      // Get all other form values
      const tradeData = {
        entryDate: formData.get("entryDate") as string,
        instrument: formData.get("instrument") as string,
        setup: setup, // Use the preserved setup value
        direction: formData.get("direction") as 'buy' | 'sell',
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
        lowestPrice: parseFloat(formData.get("lowestPrice") as string),
        notes: formData.get("notes") as string,
      };

      console.log("Final trade data to submit:", tradeData);

      if (editTrade) {
        const { data: entries, error: fetchError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('session_type', 'trade');

        if (fetchError) throw fetchError;
        
        const entry = entries?.find(entry => {
          const trades = entry.trades as any[];
          return trades?.some(trade => trade.id === editTrade.id);
        });

        if (!entry) throw new Error('Journal entry not found');

        const trades = entry.trades as any[];
        
        const updatedTradeObject = {
          id: editTrade.id,
          ...tradeData,
          setup: setup || editTrade.setup, // Ensure setup isn't lost
        };

        const updatedTrades = trades.map(trade => 
          trade.id === editTrade.id ? updatedTradeObject : trade
        );

        const { error: updateError } = await supabase
          .from('journal_entries')
          .update({ trades: updatedTrades })
          .eq('id', entry.id);

        if (updateError) throw updateError;
      } else {
        const entryDate = new Date(tradeData.entryDate);
        const tradeObject = {
          id: crypto.randomUUID(),
          ...tradeData
        };

        const { error: tradeError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user?.id,
            account_id: activeAccount?.id, // Include account_id from the active account
            notes: tradeData.notes || `Write anything that stands out for ${tradeData.instrument}`, // Use trade notes if provided
            trades: [tradeObject],
            session_type: 'trade',
            emotion: 'neutral',    
            emotion_detail: 'neutral',
            created_at: entryDate.toISOString()
          });

        if (tradeError) throw tradeError;
      }

      await onSubmit(tradeData as Trade, !!editTrade);
      onOpenChange(false);

      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center';
      overlay.innerHTML = `
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p class="text-sm text-muted-foreground">Updating...</p>
        </div>
      `;
      document.body.appendChild(overlay);

      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!editTrade) {
        sessionStorage.setItem('tradeSuccess', 'true');
        window.location.reload();
      } else {
        toast.success("Trade updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
