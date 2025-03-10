
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { createClient } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trade } from "@/types/trade";

interface JournalFormSubmissionProps {
  sessionType: "pre" | "post";
  selectedEmotion: string;
  selectedEmotionDetail: string;
  notes: string;
  selectedOutcome: string;
  followedRules: string[];
  selectedMistakes: string[];
  preTradingActivities: string[];
  trades: Trade[];
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  weeklyLabel?: string;
  dailyLabel?: string;
  fourHourLabel?: string;
  oneHourLabel?: string;
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
  trades,
  weeklyUrl,
  dailyUrl,
  fourHourUrl,
  oneHourUrl,
  weeklyLabel,
  dailyLabel,
  fourHourLabel,
  oneHourLabel,
  resetForm,
  onSubmitSuccess,
}: JournalFormSubmissionProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { incrementStreak } = useProgressTracking();
  const { user } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    
    if (
      !selectedEmotion || 
      (sessionType === "post" && !selectedOutcome)
    ) {
      toast({
        title: sessionType === "pre" ? "Please select an emotion" : "Please select an emotion and outcome",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const entryData = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        user_id: user?.id,
        session_type: sessionType,
        emotion: selectedEmotion,
        emotion_detail: selectedEmotionDetail,
        notes,
        outcome: sessionType === "post" ? selectedOutcome : null,
        followed_rules: sessionType === "post" ? followedRules : null,
        mistakes: sessionType === "post" ? selectedMistakes : null,
        pre_trading_activities: sessionType === "pre" ? preTradingActivities : null,
        trades: sessionType === "post" ? trades : null,
        weekly_url: weeklyUrl || null,
        daily_url: dailyUrl || null,
        four_hour_url: fourHourUrl || null,
        one_hour_url: oneHourUrl || null,
        weekly_label: weeklyLabel || null,
        daily_label: dailyLabel || null,
        four_hour_label: fourHourLabel || null,
        one_hour_label: oneHourLabel || null,
      };

      const { error } = await supabase
        .from("journal_entries")
        .insert(entryData);

      if (error) {
        console.error("Error submitting journal entry:", error);
        throw error;
      }

      incrementStreak(sessionType);
      resetForm();
      
      toast({
        title: `${sessionType === "pre" ? "Pre" : "Post"}-trading session logged!`,
        description: "Your journal entry has been saved.",
      });

      onSubmitSuccess?.();
      
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error saving journal entry",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return { handleSubmit, submitting };
};
