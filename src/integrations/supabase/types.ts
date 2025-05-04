export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      backtesting_sessions: {
        Row: {
          after_url: string | null
          before_url: string | null
          created_at: string
          daily_url: string | null
          description: string | null
          direction: string | null
          duration: string | null
          end_date: string
          entry_date: string | null
          entry_price: number | null
          exit_date: string | null
          exit_price: number | null
          four_hour_url: string | null
          highest_price: number | null
          id: string
          instrument: string | null
          leverage: number | null
          lowest_price: number | null
          market_type: string
          name: string
          one_hour_url: string | null
          playbook_id: string | null
          pnl: number | null
          quantity: number | null
          refined_entry_url: string | null
          setup: string | null
          start_balance: number
          start_date: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          updated_at: string
          user_id: string
          weekly_url: string | null
        }
        Insert: {
          after_url?: string | null
          before_url?: string | null
          created_at?: string
          daily_url?: string | null
          description?: string | null
          direction?: string | null
          duration?: string | null
          end_date: string
          entry_date?: string | null
          entry_price?: number | null
          exit_date?: string | null
          exit_price?: number | null
          four_hour_url?: string | null
          highest_price?: number | null
          id?: string
          instrument?: string | null
          leverage?: number | null
          lowest_price?: number | null
          market_type: string
          name: string
          one_hour_url?: string | null
          playbook_id?: string | null
          pnl?: number | null
          quantity?: number | null
          refined_entry_url?: string | null
          setup?: string | null
          start_balance: number
          start_date: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          updated_at?: string
          user_id: string
          weekly_url?: string | null
        }
        Update: {
          after_url?: string | null
          before_url?: string | null
          created_at?: string
          daily_url?: string | null
          description?: string | null
          direction?: string | null
          duration?: string | null
          end_date?: string
          entry_date?: string | null
          entry_price?: number | null
          exit_date?: string | null
          exit_price?: number | null
          four_hour_url?: string | null
          highest_price?: number | null
          id?: string
          instrument?: string | null
          leverage?: number | null
          lowest_price?: number | null
          market_type?: string
          name?: string
          one_hour_url?: string | null
          playbook_id?: string | null
          pnl?: number | null
          quantity?: number | null
          refined_entry_url?: string | null
          setup?: string | null
          start_balance?: number
          start_date?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          weekly_url?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          account_id: string | null
          created_at: string
          daily_goals: string[] | null
          daily_url: string | null
          emotion: string
          emotion_detail: string
          followed_rules: string[] | null
          four_hour_url: string | null
          id: string
          market_conditions: string | null
          mistakes: string[] | null
          notes: string
          one_hour_url: string | null
          outcome: string | null
          post_submission_notes: string | null
          pre_trading_activities: string[] | null
          session_type: string
          trades: Json[] | null
          trading_rules_notes: string | null
          user_id: string
          weekly_url: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          daily_goals?: string[] | null
          daily_url?: string | null
          emotion: string
          emotion_detail: string
          followed_rules?: string[] | null
          four_hour_url?: string | null
          id?: string
          market_conditions?: string | null
          mistakes?: string[] | null
          notes: string
          one_hour_url?: string | null
          outcome?: string | null
          post_submission_notes?: string | null
          pre_trading_activities?: string[] | null
          session_type: string
          trades?: Json[] | null
          trading_rules_notes?: string | null
          user_id: string
          weekly_url?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          daily_goals?: string[] | null
          daily_url?: string | null
          emotion?: string
          emotion_detail?: string
          followed_rules?: string[] | null
          four_hour_url?: string | null
          id?: string
          market_conditions?: string | null
          mistakes?: string[] | null
          notes?: string
          one_hour_url?: string | null
          outcome?: string | null
          post_submission_notes?: string | null
          pre_trading_activities?: string[] | null
          session_type?: string
          trades?: Json[] | null
          trading_rules_notes?: string | null
          user_id?: string
          weekly_url?: string | null
        }
        Relationships: []
      }
      notebook_folders: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notebook_notes: {
        Row: {
          content: string | null
          content_type: string | null
          created_at: string
          emoji: string | null
          folder_id: string | null
          id: string
          tag_colors: Json | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created_at?: string
          emoji?: string | null
          folder_id?: string | null
          id?: string
          tag_colors?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created_at?: string
          emoji?: string | null
          folder_id?: string | null
          id?: string
          tag_colors?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "notebook_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          invoice_url: string | null
          metadata: Json | null
          payment_method: string | null
          payment_method_info: Json | null
          status: string
          updated_at: string
          user_id: string
          xendit_payment_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          invoice_url?: string | null
          metadata?: Json | null
          payment_method?: string | null
          payment_method_info?: Json | null
          status: string
          updated_at?: string
          user_id: string
          xendit_payment_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          invoice_url?: string | null
          metadata?: Json | null
          payment_method?: string | null
          payment_method_info?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          xendit_payment_id?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json[] | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json[] | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json[] | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      progress_stats: {
        Row: {
          created_at: string
          daily_streak: number
          id: string
          last_activity: string | null
          level: number
          level_progress: number
          post_session_streak: number
          pre_session_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_streak?: number
          id?: string
          last_activity?: string | null
          level?: number
          level_progress?: number
          post_session_streak?: number
          pre_session_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_streak?: number
          id?: string
          last_activity?: string | null
          level?: number
          level_progress?: number
          post_session_streak?: number
          pre_session_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_accounts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trading_blueprints: {
        Row: {
          created_at: string
          daily_url: string | null
          description: string | null
          emoji: string | null
          entry_rules: string[] | null
          exit_rules: string[] | null
          four_hour_url: string | null
          id: string
          name: string
          one_hour_url: string | null
          refined_entry_url: string | null
          risk_management: string[] | null
          rules: string[] | null
          setup_criteria: string[] | null
          updated_at: string
          user_id: string
          weekly_url: string | null
        }
        Insert: {
          created_at?: string
          daily_url?: string | null
          description?: string | null
          emoji?: string | null
          entry_rules?: string[] | null
          exit_rules?: string[] | null
          four_hour_url?: string | null
          id?: string
          name: string
          one_hour_url?: string | null
          refined_entry_url?: string | null
          risk_management?: string[] | null
          rules?: string[] | null
          setup_criteria?: string[] | null
          updated_at?: string
          user_id: string
          weekly_url?: string | null
        }
        Update: {
          created_at?: string
          daily_url?: string | null
          description?: string | null
          emoji?: string | null
          entry_rules?: string[] | null
          exit_rules?: string[] | null
          four_hour_url?: string | null
          id?: string
          name?: string
          one_hour_url?: string | null
          refined_entry_url?: string | null
          risk_management?: string[] | null
          rules?: string[] | null
          setup_criteria?: string[] | null
          updated_at?: string
          user_id?: string
          weekly_url?: string | null
        }
        Relationships: []
      }
      week_stats: {
        Row: {
          created_at: string
          id: string
          month: number
          total_pnl: number | null
          trade_count: number | null
          trading_days: number | null
          updated_at: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          total_pnl?: number | null
          trade_count?: number | null
          trading_days?: number | null
          updated_at?: string
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          total_pnl?: number | null
          trade_count?: number | null
          trading_days?: number | null
          updated_at?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          created_at: string | null
          id: string
          improvement: string | null
          strength: string | null
          user_id: string
          weakness: string | null
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          improvement?: string | null
          strength?: string | null
          user_id: string
          weakness?: string | null
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          improvement?: string | null
          strength?: string | null
          user_id?: string
          weakness?: string | null
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_duration: {
        Args: { entry_time: string; exit_time: string }
        Returns: string
      }
      calculate_level_from_streak: {
        Args: { daily_streak: number }
        Returns: number
      }
      check_subscription: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_trade_duration: {
        Args: { entry_date: string; exit_date: string }
        Returns: unknown
      }
      get_week_number_in_month: {
        Args: { check_date: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
