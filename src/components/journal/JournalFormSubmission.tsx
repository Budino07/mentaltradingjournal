
import { useJournalToast } from "@/hooks/useJournalToast";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trade } from "@/types/trade";
import { useNotifications } from "@/contexts/NotificationsContext";

interface JournalFormSubmissionProps {
  sessionType: "pre" | "post";
  selectedEmotion: string;
  selectedEmotionDetail: string;
  notes: string;
  selectedOutcome?: string;
  followedRules?: string[];
  selectedMistakes?: string[];
  preTradingActivities: string[];
  trades: Trade[];
  weeklyUrl?: string;
  dailyUrl?: string;
  fourHourUrl?: string;
  oneHourUrl?: string;
  dailyGoals?: string[];
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
  dailyGoals,
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
  const { addNotification } = useNotifications();

  const handleSubmit = async () => {
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
      // For loss outcome, we don't require followedRules
      const isRulesRequired = selectedOutcome !== "loss";
      
      if (!selectedEmotion || !selectedEmotionDetail || !notes || !selectedOutcome) {
        toast.error("Missing Information", {
          description: "Please fill in all required fields for post-session.",
          duration: 5000,
        });
        return;
      }
      
      // Only validate followedRules if outcome is not "loss"
      if (isRulesRequired && (!followedRules || followedRules.length === 0)) {
        toast.error("Missing Information", {
          description: "Please select which trading rules you followed.",
          duration: 5000,
        });
        return;
      }
      
      // For loss outcome with negative emotion, validate mistakes are selected
      if (selectedOutcome === "loss" && 
          selectedEmotion.toLowerCase().includes("negative") && 
          (!selectedMistakes || selectedMistakes.length === 0)) {
        toast.error("Missing Information", {
          description: "Please select which trading mistakes were made.",
          duration: 5000,
        });
        return;
      }
    }

    try {
      console.log("Submitting journal entry with outcome:", selectedOutcome);
      console.log("Daily goals:", dailyGoals);
      
      const { error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        session_type: sessionType,
        emotion: selectedEmotion,
        emotion_detail: selectedEmotionDetail,
        notes,
        outcome: sessionType === "pre" ? null : selectedOutcome,
        followed_rules: followedRules,
        mistakes: selectedMistakes,
        pre_trading_activities: preTradingActivities,
        trades,
        weekly_url: weeklyUrl,
        daily_url: dailyUrl,
        four_hour_url: fourHourUrl,
        one_hour_url: oneHourUrl,
        daily_goals: dailyGoals,
        weekly_label: weeklyLabel,
        daily_label: dailyLabel,
        four_hour_label: fourHourLabel,
        one_hour_label: oneHourLabel,
      });

      if (error) {
        console.error('Error submitting journal entry:', error);
        throw error;
      }

      await updateProgress(sessionType as any);
      console.log(`Progress updated for ${sessionType} session`);
      
      // Add positivity notification if emotion is positive
      if (sessionType === "pre" && selectedEmotion.toLowerCase().includes("positive")) {
        addNotification({
          title: "Ready for the trading day! 📈",
          message: "Starting with a positive mindset is the foundation of successful trading. Trust your system!",
          type: "success"
        });
      }
      
      // Add self-awareness notification if emotion is negative but they're journaling
      if (sessionType === "pre" && selectedEmotion.toLowerCase().includes("negative")) {
        addNotification({
          title: "Self-awareness is key 🧘",
          message: "Recognizing your negative emotions is the first step to mastering them. Consider if today is the right day to trade.",
          type: "info"
        });
      }
      
      // Add milestone notification for post-session
      if (sessionType === "post" && followedRules && followedRules.length > 3) {
        addNotification({
          title: "Rule adherence is on point! 🎯",
          message: "Following your trading rules consistently is a strong indicator of professional trading behavior.",
          type: "success"
        });
      }
      
      // Add notification for loss with mistakes identified
      if (sessionType === "post" && selectedOutcome === "loss" && selectedMistakes && selectedMistakes.length > 0) {
        addNotification({
          title: "Learning from mistakes 📝",
          message: "Identifying your trading mistakes is crucial for growth. Review them carefully before your next session.",
          type: "info"
        });
      }
      
      showSuccessToast(sessionType);
      resetForm();
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting journal entry:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to submit journal entry. Please try again.",
        duration: 5000,
      });
    }
  };

  return { handleSubmit };
};
