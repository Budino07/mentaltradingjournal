
import { useState } from "react";
import { Trade } from "@/types/trade";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export const useTradeActions = (user: User | null) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrade || !user) return;

    try {
      console.log('Deleting trade:', selectedTrade);
      
      const { data: entries, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id) // Only look for entries owned by current user
        .eq('session_type', 'trade');

      if (fetchError) {
        console.error('Error fetching entries:', fetchError);
        throw fetchError;
      }

      const entryWithTrade = entries?.find(entry => 
        entry.trades?.some((trade: Trade) => trade.id === selectedTrade.id)
      );

      if (!entryWithTrade) {
        toast.error("Cannot delete trade: Trade not found in your entries");
        setIsDeleteDialogOpen(false);
        return;
      }

      // Delete the journal entry only if it belongs to the current user
      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryWithTrade.id)
        .eq('user_id', user.id); // Add user_id check for extra security

      if (deleteError) {
        console.error('Error deleting entry:', deleteError);
        throw deleteError;
      }

      toast.success('Entry deleted successfully');
      setIsDeleteDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast.error('Failed to delete trade');
    }
  };

  const handleTradeUpdate = async (updatedTrade: Trade) => {
    if (!user) {
      toast.error('You must be logged in to update trades');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      const entryWithTrade = entries?.find(entry => 
        entry.trades?.some((trade: Trade) => trade.id === updatedTrade.id)
      );

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
        setup: updatedTrade.setup,
        pnl: updatedTrade.pnl,
        forecastScreenshot: updatedTrade.forecastScreenshot,
        resultScreenshot: updatedTrade.resultScreenshot,
        htfBias: updatedTrade.htfBias,
        highestPrice: updatedTrade.highestPrice,
        lowestPrice: updatedTrade.lowestPrice
      };

      const updatedTrades = entryWithTrade?.trades.map((trade: Trade) => 
        trade.id === updatedTrade.id ? updatedTradeObject : trade
      );

      await supabase
        .from('journal_entries')
        .update({ trades: updatedTrades })
        .eq('id', entryWithTrade?.id);

      toast.success('Trade updated successfully!');
      setIsEditDialogOpen(false);
      
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
      
      window.location.reload();
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error('Failed to update trade');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedTrade,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isUpdating,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleTradeUpdate
  };
};
