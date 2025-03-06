
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useJournalEntryDelete = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDeleteClick = (entryId: string) => {
    setSelectedEntryId(entryId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntryId || !user) return;

    setIsDeleting(true);
    try {
      console.log('Deleting journal entry:', selectedEntryId);
      
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', selectedEntryId)
        .eq('user_id', user.id); // Add user_id check for extra security

      if (error) {
        console.error('Error deleting journal entry:', error);
        throw error;
      }

      toast.success('Journal entry deleted successfully');
      setIsDeleteDialogOpen(false);
      
      // Create a full-screen loading overlay for page reload
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center';
      overlay.innerHTML = `
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p class="text-sm text-muted-foreground">Refreshing...</p>
        </div>
      `;
      document.body.appendChild(overlay);

      // Short delay to ensure the overlay is visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      window.location.reload();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('Failed to delete journal entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedEntryId,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm
  };
};
