
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trade } from "@/types/trade";
import React from "react";
import { useProgressTracking } from "@/hooks/useProgressTracking";

interface JournalFormSubmissionProps {
  sessionType: string;
  selectedEmotion: string;
  selectedEmotionDetail: string;
  notes: string;
  selectedOutcome?: string;
  followedRules?: string[];
  selectedMistakes?: string[];
  preTradingActivities?: string[];
  trades?: Trade[];
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  weeklyLabel?: string;
  dailyLabel?: string;
  fourHourLabel?: string;
  oneHourLabel?: string;
  dailyGoals?: string[]; // Add this new field
  completedGoals?: string[]; // Add this new field
  resetForm: () => void;
  onSubmitSuccess?: () => void;
}

export const useJournalFormSubmission = ({
  sessionType,
  selectedEmotion,
  selectedEmotionDetail,
  notes,
  selectedOutcome,
  followedRules,
  selectedMistakes,
  preTradingActivities,
  trades = [],
  weeklyUrl,
  dailyUrl,
  fourHourUrl,
  oneHourUrl,
  weeklyLabel,
  dailyLabel,
  fourHourLabel,
  oneHourLabel,
  dailyGoals = [], // Add default value
  completedGoals = [], // Add default value
  resetForm,
  onSubmitSuccess,
}: JournalFormSubmissionProps) => {
  const { user } = useAuth();
  const { updateProgress } = useProgressTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a journal entry.");
      return;
    }

    if (!sessionType || !selectedEmotion || !selectedEmotionDetail || !notes) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Construct the journal entry data
    const journalData = {
      user_id: user?.id,
      session_type: sessionType,
      emotion: selectedEmotion,
      emotion_detail: selectedEmotionDetail,
      notes,
      outcome: selectedOutcome || null,
      followed_rules: followedRules || [],
      mistakes: selectedMistakes || [],
      pre_trading_activities: preTradingActivities || [],
      trades: trades.length > 0 ? trades : [],
      weekly_url: weeklyUrl || null,
      daily_url: dailyUrl || null,
      four_hour_url: fourHourUrl || null,
      one_hour_url: oneHourUrl || null,
      weekly_label: weeklyLabel || null,
      daily_label: dailyLabel || null,
      four_hour_label: fourHourLabel || null,
      one_hour_label: oneHourLabel || null,
      daily_goals: dailyGoals || [], // Add daily goals
      completed_goals: completedGoals || [] // Add completed goals
    };

    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([journalData]);

      if (error) {
        throw error;
      }

      toast.success("Journal entry submitted successfully!");
      resetForm();
      onSubmitSuccess?.();

      // Update progress stats after successful submission
      await updateProgress(sessionType as 'pre' | 'post');
    } catch (error: any) {
      console.error("Error submitting journal entry:", error);
      toast.error(`Failed to submit journal entry: ${error.message}`);
    }
  };

  return { handleSubmit };
};
