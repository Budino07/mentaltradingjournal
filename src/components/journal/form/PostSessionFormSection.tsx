
import { PostSessionSection } from "../PostSessionSection";
import { Trade } from "@/types/trade";
import { tradingOutcome, mistakeCategories, tradingRules } from "../emotionConfig";

interface PostSessionFormSectionProps {
  selectedOutcome: string;
  setSelectedOutcome: (outcome: string) => void;
  followedRules: string[];
  setFollowedRules: (rules: string[]) => void;
  selectedMistakes: string[];
  setSelectedMistakes: (mistakes: string[]) => void;
  trades: Trade[];
  onTradeSubmit?: (tradeData: Trade) => void;
  weeklyUrl: string;
  setWeeklyUrl: (url: string) => void;
  dailyUrl: string;
  setDailyUrl: (url: string) => void;
  fourHourUrl: string;
  setFourHourUrl: (url: string) => void;
  oneHourUrl: string;
  setOneHourUrl: (url: string) => void;
}

export const PostSessionFormSection = ({
  selectedOutcome,
  setSelectedOutcome,
  followedRules,
  setFollowedRules,
  selectedMistakes,
  setSelectedMistakes,
  trades,
  onTradeSubmit,
  weeklyUrl,
  setWeeklyUrl,
  dailyUrl,
  setDailyUrl,
  fourHourUrl,
  setFourHourUrl,
  oneHourUrl,
  setOneHourUrl,
}: PostSessionFormSectionProps) => {
  return (
    <PostSessionSection
      selectedOutcome={selectedOutcome}
      setSelectedOutcome={setSelectedOutcome}
      followedRules={followedRules}
      setFollowedRules={setFollowedRules}
      selectedMistakes={selectedMistakes}
      setSelectedMistakes={setSelectedMistakes}
      tradingOutcome={tradingOutcome}
      mistakeCategories={mistakeCategories}
      tradingRules={tradingRules}
      trades={trades}
      weeklyUrl={weeklyUrl}
      setWeeklyUrl={setWeeklyUrl}
      dailyUrl={dailyUrl}
      setDailyUrl={setDailyUrl}
      fourHourUrl={fourHourUrl}
      setFourHourUrl={setFourHourUrl}
      oneHourUrl={oneHourUrl}
      setOneHourUrl={setOneHourUrl}
    />
  );
};
