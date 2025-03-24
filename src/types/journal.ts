
export interface JournalEntryType {
  id: string;
  created_at: string;
  session_type: string;
  emotion: string;
  emotion_detail: string;
  notes: string;
  outcome?: string;
  market_conditions?: string;
  followed_rules?: string[];
  mistakes?: string[];
  pre_trading_activities?: string[];
  post_submission_notes?: string;
  trades?: any[];
  weekly_url?: string;
  daily_url?: string;
  four_hour_url?: string;
  one_hour_url?: string;
  weekly_label?: string;
  daily_label?: string;
  four_hour_label?: string;
  one_hour_label?: string;
  daily_goals?: string[]; // Add this new field
  completed_goals?: string[]; // Add this field to track which goals were completed
}
