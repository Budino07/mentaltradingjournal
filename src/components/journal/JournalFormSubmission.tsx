import { useJournalToast } from "@/hooks/useJournalToast";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trade } from "@/types/trade";

interface JournalFormSubmissionProps {
  sessionType: "pre" | "post";
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
  const { showSuccessToast } = useJournalToast();
  const { updateProgress } = useProgressTracking();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!user) {
      toast.error("Authentication Error", {
        description: "You must be logged in to submit journal entries.",
        duration: 5000,
      });
      return;
    }

    // Validate pre-session requirements
    if (sessionType === "pre") {
      if (!selectedEmotion || !selectedEmotionDetail || !notes || preTradingActivities.length === 0) {
        toast.error("Missing Information", {
          description: "Please fill in all required fields: emotion, details, activities, and notes.",
          duration: 5000,
        });
        return;
      }
    }

    // Validate post-session requirements
    if (sessionType === "post") {
      if (!selectedEmotion || !selectedEmotionDetail || !notes || !selectedOutcome || followedRules?.length === 0) {
        toast.error("Missing Information", {
          description: "Please fill in all required fields for post-session.",
          duration: 5000,
        });
        return;
      }
    }

    try {
      console.log("Submitting journal entry with outcome:", selectedOutcome);
      
      const { data, error } = await supabase
        .from("journal_entries")
        .insert([
          {
            user_id: user.id,
            session_type: sessionType,
            emotion: selectedEmotion,
            emotion_detail: selectedEmotionDetail,
            notes: notes,
            outcome: sessionType === "post" ? selectedOutcome : null,
            followed_rules: sessionType === "post" ? followedRules : null,
            mistakes: sessionType === "post" && selectedOutcome === "loss" ? selectedMistakes : null,
            pre_trading_activities: sessionType === "pre" ? preTradingActivities : null,
            weekly_url: weeklyUrl,
            daily_url: dailyUrl,
            four_hour_url: fourHourUrl,
            one_hour_url: oneHourUrl,
            weekly_label: weeklyLabel,
            daily_label: dailyLabel,
            four_hour_label: fourHourLabel,
            one_hour_label: oneHourLabel,
          },
        ])
        .select();

      if (error) {
        console.error('Error submitting journal entry:', error);
        throw error;
      }

      await updateProgress(sessionType);
      console.log(`Progress updated for ${sessionType} session`);
      showSuccessToast(sessionType);
      resetForm();
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting journal entry:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to submit journal entry. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
