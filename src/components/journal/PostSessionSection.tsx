
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trade } from "@/types/trade";
import { TradesList } from "./entry/TradesList";
import { TradingOutcomeSection } from "./post-session/TradingOutcomeSection";
import { TradingRulesSection } from "./post-session/TradingRulesSection";
import { ObservationsSection } from "./post-session/ObservationsSection";
import { MistakesSection } from "./post-session/MistakesSection";

interface PostSessionSectionProps {
  selectedOutcome: string;
  setSelectedOutcome: (outcome: string) => void;
  followedRules: string[];
  setFollowedRules: (rules: string[]) => void;
  selectedMistakes: string[];
  setSelectedMistakes: (mistakes: string[]) => void;
  tradingOutcome: { label: string; value: string }[];
  mistakeCategories: { label: string; value: string }[];
  tradingRules: { label: string; value: string }[];
  trades: Trade[];
  weeklyUrl: string;
  setWeeklyUrl: (url: string) => void;
  dailyUrl: string;
  setDailyUrl: (url: string) => void;
  fourHourUrl: string;
  setFourHourUrl: (url: string) => void;
  oneHourUrl: string;
  setOneHourUrl: (url: string) => void;
}

export const PostSessionSection = ({
  selectedOutcome,
  setSelectedOutcome,
  followedRules,
  setFollowedRules,
  selectedMistakes,
  setSelectedMistakes,
  tradingOutcome,
  mistakeCategories,
  tradingRules,
  trades,
  weeklyUrl,
  setWeeklyUrl,
  dailyUrl,
  setDailyUrl,
  fourHourUrl,
  setFourHourUrl,
  oneHourUrl,
  setOneHourUrl,
}: PostSessionSectionProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <TradingOutcomeSection
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
          />

          <Separator />

          <TradingRulesSection
            followedRules={followedRules}
            setFollowedRules={setFollowedRules}
          />

          {selectedOutcome === "loss" && (
            <>
              <Separator />
              <MistakesSection
                selectedMistakes={selectedMistakes}
                setSelectedMistakes={setSelectedMistakes}
                mistakeCategories={mistakeCategories}
              />
            </>
          )}

          <Separator />

          <ObservationsSection
            weeklyUrl={weeklyUrl}
            dailyUrl={dailyUrl}
            fourHourUrl={fourHourUrl}
            oneHourUrl={oneHourUrl}
            onWeeklyUrlChange={setWeeklyUrl}
            onDailyUrlChange={setDailyUrl}
            onFourHourUrlChange={setFourHourUrl}
            onOneHourUrlChange={setOneHourUrl}
          />
        </div>
      </Card>

      {trades && trades.length > 0 && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Trades</h3>
              <p className="text-sm text-muted-foreground">
                Review your trades for this session
              </p>
            </div>
            <TradesList trades={trades} />
          </div>
        </Card>
      )}

      <Separator />
    </div>
  );
};
