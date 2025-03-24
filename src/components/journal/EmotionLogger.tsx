
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { SessionProgress } from "./SessionProgress";
import { PreTradingActivities } from "./PreTradingActivities";
import { useJournalFormSubmission } from "./JournalFormSubmission";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { Trade } from "@/types/trade";
import { FormSubmissionSection } from "./FormSubmissionSection";
import { FormHeader } from "./form/FormHeader";
import { EmotionSection } from "./form/EmotionSection";
import { PostSessionFormSection } from "./form/PostSessionFormSection";
import { ProgressStats } from "./ProgressStats";
import { TradingOutcomeSection } from "./post-session/TradingOutcomeSection";
import { TradingRulesSection } from "./post-session/TradingRulesSection";
import { ObservationsSection } from "./post-session/ObservationsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { DailyGoals } from "./DailyGoals";

const PRE_TRADING_ACTIVITIES = [
  "Meditation",
  "Exercise",
  "Review Daily Goals",
  "Cold Shower",
  "Good Sleep",
  "Affirmations"
];

interface EmotionLoggerProps {
  initialSessionType?: "pre" | "post";
  onSubmitSuccess?: () => void;
}

export const EmotionLogger = ({ 
  initialSessionType,
  onSubmitSuccess 
}: EmotionLoggerProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedEmotionDetail, setSelectedEmotionDetail] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [customDetails, setCustomDetails] = useState<string[]>([]);
  const [sessionType, setSessionType] = useState<"pre" | "post">(initialSessionType || "pre");
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [followedRules, setFollowedRules] = useState<string[]>([]);
  const [preTradingActivities, setPreTradingActivities] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [weeklyUrl, setWeeklyUrl] = useState('');
  const [dailyUrl, setDailyUrl] = useState('');
  const [fourHourUrl, setFourHourUrl] = useState('');
  const [oneHourUrl, setOneHourUrl] = useState('');
  const [dailyGoals, setDailyGoals] = useState<string[]>([]);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  const [weeklyLabel, setWeeklyLabel] = useState('Weekly');
  const [dailyLabel, setDailyLabel] = useState('Daily');
  const [fourHourLabel, setFourHourLabel] = useState('4HR');
  const [oneHourLabel, setOneHourLabel] = useState('1HR/15m');
  
  const { stats } = useProgressTracking();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (initialSessionType) {
      setSessionType(initialSessionType);
    }
  }, [initialSessionType]);

  const resetForm = () => {
    setSelectedEmotion("");
    setSelectedEmotionDetail("");
    setSelectedOutcome("");
    setNotes("");
    setSelectedMistakes([]);
    setFollowedRules([]);
    setPreTradingActivities([]);
    setTrades([]);
    setWeeklyUrl('');
    setDailyUrl('');
    setFourHourUrl('');
    setOneHourUrl('');
    setDailyGoals([]);
    setCompletedGoals([]);
  };

  const { handleSubmit } = useJournalFormSubmission({
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
    completedGoals,
    resetForm,
    onSubmitSuccess: () => {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onSubmitSuccess?.();
      }, 5000);
    },
  });

  const handleEmotionSelect = (value: string) => {
    setSelectedEmotion(value);
    if (sessionType === "post") {
      setIsDetailDialogOpen(true);
    } else {
      setSelectedEmotionDetail(value);
    }
  };

  const handleDetailSelect = (detail: string) => {
    setSelectedEmotionDetail(detail);
    setIsDetailDialogOpen(false);
  };

  const handleCustomDetailAdd = (detail: string) => {
    if (!customDetails.includes(detail)) {
      setCustomDetails([...customDetails, detail]);
    }
  };

  const handleTradeSubmit = (tradeData: Trade) => {
    setTrades([...trades, tradeData]);
  };

  return (
    <div className={`grid gap-4 md:gap-6 lg:grid-cols-[1fr,300px] mt-0 md:mt-0 ${isMobile ? 'mx-0' : ''}`}>
      <Card className={`${isMobile ? 'p-3' : 'p-4 md:p-8'} space-y-6 md:space-y-8 bg-card/30 backdrop-blur-xl border-primary/10 shadow-2xl`}>
        <FormHeader 
          sessionType={sessionType}
          onSessionTypeChange={setSessionType}
          disableTypeChange={!!initialSessionType}
        />

        <SessionProgress 
          emotionSelected={!!selectedEmotion}
          emotionDetailSelected={!!selectedEmotionDetail}
          activitiesSelected={preTradingActivities.length > 0}
          notesEntered={notes.length > 0}
          outcomeSelected={!!selectedOutcome}
          rulesSelected={followedRules.length > 0}
          mistakesReviewed={selectedMistakes.length > 0}
          tradesAdded={trades.length > 0}
          isPostSession={sessionType === "post"}
          showCelebration={showCelebration}
        />

        {sessionType === "pre" && (
          <>
            <DailyGoals
              dailyGoals={dailyGoals}
              setDailyGoals={setDailyGoals}
            />
            
            <PreTradingActivities
              activities={PRE_TRADING_ACTIVITIES}
              selectedActivities={preTradingActivities}
              onActivityChange={setPreTradingActivities}
            />
          </>
        )}
        
        <div className="space-y-4 md:space-y-6">
          <EmotionSection
            sessionType={sessionType}
            selectedEmotion={selectedEmotion}
            selectedEmotionDetail={selectedEmotionDetail}
            isDetailDialogOpen={isDetailDialogOpen}
            customDetails={customDetails}
            onEmotionSelect={handleEmotionSelect}
            onDetailSelect={handleDetailSelect}
            onDetailDialogOpenChange={setIsDetailDialogOpen}
            onCustomDetailAdd={handleCustomDetailAdd}
          />

          {sessionType === "post" && (
            <PostSessionFormSection
              selectedOutcome={selectedOutcome}
              setSelectedOutcome={setSelectedOutcome}
              followedRules={followedRules}
              setFollowedRules={setFollowedRules}
              selectedMistakes={selectedMistakes}
              setSelectedMistakes={setSelectedMistakes}
              trades={trades}
              onTradeSubmit={handleTradeSubmit}
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
              dailyGoals={dailyGoals}
              setDailyGoals={setDailyGoals}
              completedGoals={completedGoals}
              setCompletedGoals={setCompletedGoals}
            />
          )}

          <FormSubmissionSection
            sessionType={sessionType}
            notes={notes}
            setNotes={setNotes}
            trades={trades}
            handleSubmit={(e) => handleSubmit(e)}
            selectedOutcome={selectedOutcome}
          />
        </div>
      </Card>

      {!isMobile && (
        <ProgressStats 
          preSessionStreak={stats.preSessionStreak}
          postSessionStreak={stats.postSessionStreak}
          dailyStreak={stats.dailyStreak}
          level={stats.level}
          levelProgress={stats.levelProgress}
        />
      )}
      
      {isMobile && (
        <div className="mb-4">
          <ProgressStats 
            preSessionStreak={stats.preSessionStreak}
            postSessionStreak={stats.postSessionStreak}
            dailyStreak={stats.dailyStreak}
            level={stats.level}
            levelProgress={stats.levelProgress}
          />
        </div>
      )}
    </div>
  );
};
