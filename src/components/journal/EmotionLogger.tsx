import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EmotionDetailDialog } from "./EmotionDetailDialog";
import { SessionProgress } from "./SessionProgress";
import { PostSessionSection } from "./PostSessionSection";
import { ProgressStats } from "./ProgressStats";
import { useJournalFormSubmission } from "./JournalFormSubmission";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { PreTradingActivities } from "./PreTradingActivities";
import { EmotionSelector } from "./EmotionSelector";
import { emotions, tradingOutcome, mistakeCategories, tradingRules } from "./emotionConfig";
import { AddTradeDialog } from "../analytics/AddTradeDialog";
import { Trade } from "@/types/trade";
import { FormSubmissionSection } from "./FormSubmissionSection";

const PRE_TRADING_ACTIVITIES = [
  "Meditation",
  "Exercise",
  "News Reading",
  "Market Analysis",
  "Trading Plan Review"
];

export const EmotionLogger = () => {
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedEmotionDetail, setSelectedEmotionDetail] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [customDetails, setCustomDetails] = useState<string[]>([]);
  const [sessionType, setSessionType] = useState<"pre" | "post">("pre");
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [marketConditions, setMarketConditions] = useState("");
  const [followedRules, setFollowedRules] = useState<string[]>([]);
  const [preTradingActivities, setPreTradingActivities] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAddTradeDialog, setShowAddTradeDialog] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  
  const { stats } = useProgressTracking();

  const resetForm = () => {
    setSelectedEmotion("");
    setSelectedEmotionDetail("");
    setSelectedOutcome("");
    setNotes("");
    setSelectedMistakes([]);
    setMarketConditions("");
    setFollowedRules([]);
    setPreTradingActivities([]);
    setTrades([]);
  };

  const { handleSubmit } = useJournalFormSubmission({
    sessionType,
    selectedEmotion,
    selectedEmotionDetail,
    notes,
    selectedOutcome,
    marketConditions,
    followedRules,
    selectedMistakes,
    preTradingActivities,
    trades,
    resetForm,
    onSubmitSuccess: () => {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    },
  });

  const handleEmotionSelect = (value: string) => {
    setSelectedEmotion(value);
    setIsDetailDialogOpen(true);
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

  const handleSessionTypeChange = (value: "pre" | "post") => {
    setSessionType(value);
    setShowCelebration(false);
  };

  const handleTradeSubmit = (tradeData: Trade) => {
    setTrades([...trades, tradeData]);
    setShowAddTradeDialog(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      <Card className="p-8 space-y-8 bg-card/30 backdrop-blur-xl border-primary/10 shadow-2xl">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            {sessionType === "pre" ? "Pre-Session Check-in" : "Post-Session Review"}
          </h2>
          
          <SessionTypeSelector
            sessionType={sessionType}
            onSessionTypeChange={handleSessionTypeChange}
          />

          <SessionProgress 
            emotionSelected={!!selectedEmotion}
            emotionDetailSelected={!!selectedEmotionDetail}
            activitiesSelected={preTradingActivities.length > 0}
            notesEntered={notes.length > 0}
            outcomeSelected={!!selectedOutcome}
            marketConditionsSelected={!!marketConditions}
            rulesSelected={followedRules.length > 0}
            mistakesReviewed={selectedMistakes.length > 0 || selectedOutcome !== "loss"}
            tradesAdded={trades.length > 0}
            isPostSession={sessionType === "post"}
            showCelebration={showCelebration}
          />
        </div>

        {sessionType === "pre" && (
          <PreTradingActivities
            activities={PRE_TRADING_ACTIVITIES}
            selectedActivities={preTradingActivities}
            onActivityChange={setPreTradingActivities}
          />
        )}
        
        <div className="space-y-6">
          <EmotionSelector
            selectedEmotion={selectedEmotion}
            onEmotionSelect={handleEmotionSelect}
          />

          <EmotionDetailDialog
            isOpen={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            details={selectedEmotion ? emotions.find(e => e.value === selectedEmotion)?.details || [] : []}
            onDetailSelect={handleDetailSelect}
            selectedDetail={selectedEmotionDetail}
            customDetails={customDetails}
            onCustomDetailAdd={handleCustomDetailAdd}
          />

          {sessionType === "post" && (
            <>
              <PostSessionSection
                selectedOutcome={selectedOutcome}
                setSelectedOutcome={setSelectedOutcome}
                marketConditions={marketConditions}
                setMarketConditions={setMarketConditions}
                followedRules={followedRules}
                setFollowedRules={setFollowedRules}
                selectedMistakes={selectedMistakes}
                setSelectedMistakes={setSelectedMistakes}
                tradingOutcome={tradingOutcome}
                mistakeCategories={mistakeCategories}
                tradingRules={tradingRules}
                onAddTrade={() => setShowAddTradeDialog(true)}
                trades={trades}
              />

              <AddTradeDialog
                open={showAddTradeDialog}
                onOpenChange={setShowAddTradeDialog}
                onSubmit={handleTradeSubmit}
              />
            </>
          )}

          <FormSubmissionSection
            sessionType={sessionType}
            notes={notes}
            setNotes={setNotes}
            trades={trades}
            handleSubmit={handleSubmit}
          />
        </div>
      </Card>

      <ProgressStats 
        preSessionStreak={stats.preSessionStreak}
        postSessionStreak={stats.postSessionStreak}
        dailyStreak={stats.dailyStreak}
        level={stats.level}
        levelProgress={stats.levelProgress}
      />
    </div>
  );
};