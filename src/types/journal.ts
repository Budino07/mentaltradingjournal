
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
}
