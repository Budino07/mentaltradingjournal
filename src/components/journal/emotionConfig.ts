import { Smile, Meh, Frown, ThumbsUp, Equal, ThumbsDown, MinusCircle, Activity } from "lucide-react";
import { Emotion, TradingOutcome, MistakeCategory, TradingRule } from "./types";

export const emotions: Emotion[] = [
  { 
    icon: Smile, 
    label: "Positive", 
    value: "positive",
    details: [
      "Confident",
      "Motivated",
      "Focused",
      "Energetic",
      "Grateful",
      "Optimistic"
    ]
  },
  { 
    icon: Meh, 
    label: "Neutral", 
    value: "neutral",
    details: [
      "Calm",
      "Reserved",
      "Observant",
      "Patient",
      "Balanced",
      "Steady"
    ]
  },
  { 
    icon: Frown, 
    label: "Negative", 
    value: "negative",
    details: [
      "Losing Streak",
      "Family pressures",
      "Career pressure",
      "Stressed from work",
      "Conflicted with a loved one or friend",
      "Hungover",
      "Market Volatility",
      "Technical Issues",
      "Health Issues"
    ]
  },
];

export const tradingOutcome: TradingOutcome[] = [
  { icon: ThumbsUp, label: "Win", value: "win" },
  { icon: Equal, label: "Breakeven", value: "breakeven" },
  { icon: ThumbsDown, label: "Loss", value: "loss" },
  { icon: Activity, label: "Open Trade", value: "open_trade" },
  { icon: MinusCircle, label: "No Trades", value: "no_trades" },
];

export const mistakeCategories: MistakeCategory[] = [
  { label: "Revenge Trading", value: "revenge_trading" },
  { label: "Moving Stop-Loss", value: "moving_stop_loss" },
  { label: "FOMO Trade", value: "fomo_trade" },
  { label: "Over-leveraging", value: "over_leveraging" },
  { label: "Breaking Trading Plan", value: "breaking_plan" },
  { label: "No Trading Mistakes", value: "no_mistakes" },
];

export const tradingRules: TradingRule[] = [
  { label: "Proper Position Sizing", value: "position_sizing" },
  { label: "Stop Loss Placement", value: "stop_loss" },
  { label: "Risk/Reward Ratio", value: "risk_reward" },
  { label: "Trading Hours", value: "trading_hours" },
  { label: "Entry Criteria", value: "entry_criteria" },
  { label: "Exit Strategy", value: "exit_strategy" },
];
