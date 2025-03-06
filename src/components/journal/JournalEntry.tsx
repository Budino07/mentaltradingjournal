
import { Card } from "@/components/ui/card";
import { SessionHeader } from "./SessionHeader";
import { EntryContent } from "./entry/EntryContent";
import { Trade } from "@/types/trade";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useJournalEntryDelete } from "./entry/hooks/useJournalEntryDelete";
import { JournalEntryDeleteDialog } from "./entry/JournalEntryDeleteDialog";

interface JournalEntry {
  id: string;
  created_at: string;
  session_type: string;
  emotion: string;
  emotion_detail: string;
  notes: string;
  outcome?: string;
  market_conditions?: string;
  trades?: Trade[];
  followed_rules?: string[];
  post_submission_notes?: string;
  pre_trading_activities?: string[];
  weekly_url?: string;
  daily_url?: string;
  four_hour_url?: string;
  one_hour_url?: string;
}

interface JournalEntryProps {
  entry: JournalEntry;
}

export const JournalEntry = ({ entry }: JournalEntryProps) => {
  const queryClient = useQueryClient();
  const { 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
    isDeleting,
    handleDeleteClick, 
    handleDeleteConfirm 
  } = useJournalEntryDelete();

  // Subscribe to real-time updates for trades
  useEffect(() => {
    const channel = supabase
      .channel('trades_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `id=eq.${entry.id}`,
        },
        async (payload) => {
          console.log('Journal entry updated:', payload);
          // Invalidate and refetch queries
          await queryClient.invalidateQueries({
            queryKey: ['journal-entries'],
            exact: true,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entry.id, queryClient]);

  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="p-6 rounded-lg bg-background/50 border border-primary/10 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <SessionHeader
            date={formattedDate}
            sessionType={entry.session_type}
            emotion={entry.emotion}
            emotionDetail={entry.emotion_detail}
            outcome={entry.outcome}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(entry.id)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete entry</span>
          </Button>
        </div>

        <EntryContent
          id={entry.id}
          marketConditions={entry.market_conditions}
          notes={entry.notes}
          followedRules={entry.followed_rules}
          trades={entry.trades}
          postSubmissionNotes={entry.post_submission_notes}
          preTradingActivities={entry.pre_trading_activities}
          weeklyUrl={entry.weekly_url}
          dailyUrl={entry.daily_url}
          fourHourUrl={entry.four_hour_url}
          oneHourUrl={entry.one_hour_url}
        />
      </div>

      <JournalEntryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Card>
  );
};
