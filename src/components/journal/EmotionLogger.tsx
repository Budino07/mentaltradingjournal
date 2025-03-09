
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmotionSelector } from "./EmotionSelector";
import { EmotionDetailDialog } from "./EmotionDetailDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { JournalFormSubmission } from "./JournalFormSubmission";
import { FormSubmissionSection } from "./FormSubmissionSection";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { useJournalToast } from "@/hooks/useJournalToast";
import { SessionProgress } from "./SessionProgress";
import { PostSessionFormSection } from "./form/PostSessionFormSection";
import { Trade } from "@/types/trade";
import { v4 as uuidv4 } from 'uuid';
import { PreTradingActivities } from "./PreTradingActivities";
import { PreSessionProgress } from "./PreSessionProgress";
import { PreSessionSection } from "./PreSessionSection";

export const EmotionLogger = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [emotionDialogOpen, setEmotionDialogOpen] = useState(false);
  const [emotionDetail, setEmotionDetail] = useState<string>("");
  const [sessionType, setSessionType] = useState<string>("pre");
  const [notes, setNotes] = useState<string>("");
  const [marketConditions, setMarketConditions] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
  const [followedRules, setFollowedRules] = useState<string[]>([]);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [postSubmissionNotes, setPostSubmissionNotes] = useState<string>("");
  const [preTradingActivities, setPreTradingActivities] = useState<string[]>([]);
  const [weeklyUrl, setWeeklyUrl] = useState<string>("");
  const [dailyUrl, setDailyUrl] = useState<string>("");
  const [fourHourUrl, setFourHourUrl] = useState<string>("");
  const [oneHourUrl, setOneHourUrl] = useState<string>("");
  const [weeklyLabel, setWeeklyLabel] = useState<string>("Weekly");
  const [dailyLabel, setDailyLabel] = useState<string>("Daily");
  const [fourHourLabel, setFourHourLabel] = useState<string>("4HR");
  const [oneHourLabel, setOneHourLabel] = useState<string>("1HR/15m");

  const { trackPreSession, trackPostSession } = useProgressTracking();
  const { showJournalToast } = useJournalToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEmotionClick = (emotion: string) => {
    setSelectedEmotion(emotion);
    setEmotionDialogOpen(true);
  };

  const handleEmotionDetailSubmit = (detail: string) => {
    setEmotionDetail(detail);
    setEmotionDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a journal entry");
      return;
    }

    if (!selectedEmotion) {
      toast.error("Please select an emotion before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const entryId = uuidv4();

      let entry = {
        id: entryId,
        user_id: user.id,
        emotion: selectedEmotion,
        emotion_detail: emotionDetail,
        notes: notes,
        session_type: sessionType,
      };

      // Add fields based on session type
      if (sessionType === "pre") {
        entry = {
          ...entry,
          pre_trading_activities: preTradingActivities,
          market_conditions: marketConditions,
        };
      } else if (sessionType === "post") {
        entry = {
          ...entry,
          outcome: selectedOutcome,
          followed_rules: followedRules,
          mistakes: selectedMistakes,
          post_submission_notes: postSubmissionNotes,
          weekly_url: weeklyUrl,
          daily_url: dailyUrl,
          four_hour_url: fourHourUrl,
          one_hour_url: oneHourUrl,
          weekly_label: weeklyLabel,
          daily_label: dailyLabel,
          four_hour_label: fourHourLabel,
          one_hour_label: oneHourLabel,
        };
      }

      // Insert the entry into the database
      const { error } = await supabase
        .from("journal_entries")
        .insert([entry]);

      if (error) throw error;

      // Track progress based on session type
      if (sessionType === "pre") {
        trackPreSession();
      } else if (sessionType === "post") {
        trackPostSession();
      }

      showJournalToast();
      navigate("/journal");
    } catch (error) {
      console.error("Error submitting journal entry:", error);
      toast.error("Failed to submit journal entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTradeSubmit = (tradeData: Trade) => {
    setTrades((prev) => [...prev, tradeData]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {sessionType === "pre" ? (
          <SessionProgress />
        ) : sessionType === "post" ? (
          <PreSessionProgress />
        ) : null}

        <Card className="p-6 bg-card/30 backdrop-blur-xl border-primary/10">
          <div className="space-y-6">
            <SessionTypeSelector
              sessionType={sessionType}
              setSessionType={setSessionType}
            />

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emotion">How are you feeling?</Label>
                <EmotionSelector
                  selectedEmotion={selectedEmotion}
                  onEmotionClick={handleEmotionClick}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add your notes here..."
                  className="h-32"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {sessionType === "pre" && (
                <PreSessionSection
                  marketConditions={marketConditions}
                  setMarketConditions={setMarketConditions}
                  preTradingActivities={preTradingActivities}
                  setPreTradingActivities={setPreTradingActivities}
                />
              )}

              {sessionType === "post" && (
                <PostSessionFormSection
                  selectedOutcome={selectedOutcome}
                  setSelectedOutcome={setSelectedOutcome}
                  followedRules={followedRules}
                  setFollowedRules={setFollowedRules}
                  selectedMistakes={selectedMistakes}
                  setSelectedMistakes={setSelectedMistakes}
                  trades={trades}
                  onTradeSubmit={onTradeSubmit}
                  weeklyUrl={weeklyUrl}
                  setWeeklyUrl={setWeeklyUrl}
                  dailyUrl={dailyUrl}
                  setDailyUrl={setDailyUrl}
                  fourHourUrl={fourHourUrl}
                  setFourHourUrl={setFourHourUrl}
                  oneHourUrl={oneHourUrl}
                  setOneHourUrl={setOneHourUrl}
                  weeklyLabel={weeklyLabel}
                  setWeeklyLabel={setWeeklyLabel}
                  dailyLabel={dailyLabel}
                  setDailyLabel={setDailyLabel}
                  fourHourLabel={fourHourLabel}
                  setFourHourLabel={setFourHourLabel}
                  oneHourLabel={oneHourLabel}
                  setOneHourLabel={setOneHourLabel}
                />
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!selectedEmotion || isSubmitting}
                className="gradient-button bg-gradient-to-r from-primary-light to-accent hover:from-primary-light/90 hover:to-accent/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Entry"}
              </Button>
            </div>
          </div>
        </Card>

        <EmotionDetailDialog
          open={emotionDialogOpen}
          onOpenChange={setEmotionDialogOpen}
          emotion={selectedEmotion}
          onSubmit={handleEmotionDetailSubmit}
        />
      </div>

      {sessionType === "trade" && (
        <JournalFormSubmission onTradeSubmit={onTradeSubmit} />
      )}

      {trades.length > 0 && (
        <FormSubmissionSection
          trades={trades}
          onTradeDelete={(id) =>
            setTrades((prev) => prev.filter((t) => t.id !== id))
          }
        />
      )}
    </div>
  );
};
