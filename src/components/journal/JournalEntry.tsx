
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
  mistakes?: string[];
  post_submission_notes?: string;
  pre_trading_activities?: string[];
  daily_goals?: string[];
  weekly_url?: string;
  daily_url?: string;
  four_hour_url?: string;
  one_hour_url?: string;
  weekly_label?: string;
  daily_label?: string;
  four_hour_label?: string;
  one_hour_label?: string;
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

  // Separate trades from the rest of the content
  const trades = entry.trades || [];

  return (
    <div className="book-layout mb-8 flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg">
      {/* Left page - Reflections */}
      <div className="left-page w-full md:w-1/2 bg-background/80 border-r border-primary/10 p-6 rounded-l-lg">
        <div className="flex justify-between items-start mb-4">
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

        <div className="page-content h-full">
          <EntryContent
            id={entry.id}
            marketConditions={entry.market_conditions}
            notes={entry.notes}
            followedRules={entry.followed_rules}
            mistakes={entry.mistakes}
            trades={[]} // Don't show trades here
            postSubmissionNotes={entry.post_submission_notes}
            preTradingActivities={entry.pre_trading_activities}
            dailyGoals={entry.daily_goals}
            weeklyUrl={entry.weekly_url}
            dailyUrl={entry.daily_url}
            fourHourUrl={entry.four_hour_url}
            oneHourUrl={entry.one_hour_url}
            weeklyLabel={entry.weekly_label}
            dailyLabel={entry.daily_label}
            fourHourLabel={entry.four_hour_label}
            oneHourLabel={entry.one_hour_label}
          />
        </div>
      </div>

      {/* Right page - Trades */}
      <div className="right-page w-full md:w-1/2 bg-background/50 p-6 rounded-r-lg">
        <div className="page-content">
          <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">Trade Entries</span>
          </h3>
          {trades.length > 0 ? (
            <div className="space-y-4">
              <TradesList journalEntryId={entry.id} trades={trades} />
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No trades recorded for this session
            </p>
          )}
        </div>
      </div>

      <JournalEntryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};
