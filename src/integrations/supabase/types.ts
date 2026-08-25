export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          channel: string
          clicks: number
          created_at: string
          end_date: string | null
          id: string
          impressions: number
          name: string
          spend: number
          start_date: string | null
          updated_at: string
          utm_campaign: string | null
        }
        Insert: {
          channel?: string
          clicks?: number
          created_at?: string
          end_date?: string | null
          id?: string
          impressions?: number
          name: string
          spend?: number
          start_date?: string | null
          updated_at?: string
          utm_campaign?: string | null
        }
        Update: {
          channel?: string
          clicks?: number
          created_at?: string
          end_date?: string | null
          id?: string
          impressions?: number
          name?: string
          spend?: number
          start_date?: string | null
          updated_at?: string
          utm_campaign?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_index: number | null
          event_name: string
          event_type: string
          id: string
          metadata: Json
          path: string | null
          referrer: string | null
          session_id: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_index?: number | null
          event_name: string
          event_type?: string
          id?: string
          metadata?: Json
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_index?: number | null
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
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
      broker_accounts: {
        Row: {
          balance: number | null
          connection_status: string | null
          created_at: string
          currency: string | null
          equity: number | null
          id: string
          last_sync_at: string | null
          login: string
          name: string | null
          platform: string
          provider: string
          provider_account_id: string | null
          server: string
          state: string
          sync_error: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          connection_status?: string | null
          created_at?: string
          currency?: string | null
          equity?: number | null
          id?: string
          last_sync_at?: string | null
          login: string
          name?: string | null
          platform: string
          provider?: string
          provider_account_id?: string | null
          server: string
          state?: string
          sync_error?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          connection_status?: string | null
          created_at?: string
          currency?: string | null
          equity?: number | null
          id?: string
          last_sync_at?: string | null
          login?: string
          name?: string | null
          platform?: string
          provider?: string
          provider_account_id?: string | null
          server?: string
          state?: string
          sync_error?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      imported_trades: {
        Row: {
          broker_account_id: string
          close_price: number | null
          close_time: string | null
          comment: string | null
          commission: number | null
          created_at: string
          direction: string | null
          external_id: string
          id: string
          open_price: number | null
          open_time: string | null
          profit: number | null
          raw: Json
          stop_loss: number | null
          swap: number | null
          symbol: string | null
          take_profit: number | null
          updated_at: string
          user_id: string
          volume: number | null
        }
        Insert: {
          broker_account_id: string
          close_price?: number | null
          close_time?: string | null
          comment?: string | null
          commission?: number | null
          created_at?: string
          direction?: string | null
          external_id: string
          id?: string
          open_price?: number | null
          open_time?: string | null
          profit?: number | null
          raw?: Json
          stop_loss?: number | null
          swap?: number | null
          symbol?: string | null
          take_profit?: number | null
          updated_at?: string
          user_id: string
          volume?: number | null
        }
        Update: {
          broker_account_id?: string
          close_price?: number | null
          close_time?: string | null
          comment?: string | null
          commission?: number | null
          created_at?: string
          direction?: string | null
          external_id?: string
          id?: string
          open_price?: number | null
          open_time?: string | null
          profit?: number | null
          raw?: Json
          stop_loss?: number | null
          swap?: number | null
          symbol?: string | null
          take_profit?: number | null
          updated_at?: string
          user_id?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_trades_broker_account_id_fkey"
            columns: ["broker_account_id"]
            isOneToOne: false
            referencedRelation: "broker_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      plan_prices: {
        Row: {
          created_at: string
          currency: string
          interval: string
          nickname: string | null
          price_id: string
          unit_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          interval?: string
          nickname?: string | null
          price_id: string
          unit_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          interval?: string
          nickname?: string | null
          price_id?: string
          unit_amount?: number
          updated_at?: string
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
          cancellation_comment: string | null
          cancellation_reason: string | null
          cancellation_source: string | null
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
          cancellation_comment?: string | null
          cancellation_reason?: string | null
          cancellation_source?: string | null
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
          cancellation_comment?: string | null
          cancellation_reason?: string | null
          cancellation_source?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      admin_acquisition: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_activation: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_active_users: {
        Args: { p_end: string; p_start: string }
        Returns: {
          dau: number
          day: string
          mau: number
          wau: number
        }[]
      }
      admin_activity: {
        Args: { p_end?: string; p_start?: string }
        Returns: {
          kind: string
          label: string
          ts: string
          user_id: string
        }[]
      }
      admin_activity_breakdown: {
        Args: { p_end: string; p_start: string }
        Returns: {
          avg_seconds: number
          feature: string
          kind: string
          share: number
          total_seconds: number
          users: number
          uses: number
        }[]
      }
      admin_cancellation_comments: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          canceled_at: string
          comment: string
          reason: string
        }[]
      }
      admin_cancellation_reasons: {
        Args: { p_end: string; p_start: string }
        Returns: {
          avg_months: number
          cancels: number
          reason: string
          share: number
          users: number
        }[]
      }
      admin_churn_trend: {
        Args: { p_weeks?: number }
        Returns: {
          base: number
          churn_rate: number
          churned: number
          week: string
        }[]
      }
      admin_cohort_retention: {
        Args: { p_cohorts?: number; p_periods?: number }
        Returns: {
          cohort: string
          cohort_size: number
          period: number
          retained: number
        }[]
      }
      admin_device_breakdown: {
        Args: { p_end: string; p_start: string }
        Returns: {
          avg_seconds: number
          bounce_rate: number
          device: string
          pages_per_session: number
          sessions: number
          signups: number
          visitors: number
        }[]
      }
      admin_engagement_quality: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_feature_usage: {
        Args: { p_end: string; p_start: string }
        Returns: {
          feature: string
          users: number
          uses: number
        }[]
      }
      admin_growth_series: {
        Args: { p_bucket?: string; p_end: string; p_start: string }
        Returns: {
          bucket: string
          cumulative: number
          signups: number
        }[]
      }
      admin_kpis: { Args: never; Returns: Json }
      admin_kpis_range:
        | { Args: { p_end: string; p_start: string }; Returns: Json }
        | {
            Args: { p_end: string; p_segment?: string; p_start: string }
            Returns: Json
          }
      admin_landing_pages: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          avg_pages: number
          avg_seconds: number
          bounce_rate: number
          path: string
          signups: number
          visits: number
        }[]
      }
      admin_monetization: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_page_bounce: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          avg_seconds: number
          bounce_rate: number
          entries: number
          path: string
        }[]
      }
      admin_retention_dn: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_sessions_base: {
        Args: { p_end: string; p_start: string }
        Returns: {
          device_type: string
          ended: string
          landing_path: string
          pageviews: number
          referrer: string
          session_id: string
          started: string
          user_id: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
          visitor_id: string
        }[]
      }
      admin_sessions_series: {
        Args: { p_end: string; p_start: string }
        Returns: {
          avg_duration_sec: number
          day: string
          sessions: number
        }[]
      }
      admin_signup_funnel: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      admin_source_of: {
        Args: { p_referrer: string; p_utm_medium: string; p_utm_source: string }
        Returns: string
      }
      admin_subscription_stats: { Args: never; Returns: Json }
      admin_top_referrers: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          referrer: string
          signups: number
          visitors: number
          visits: number
        }[]
      }
      admin_traffic_sources: {
        Args: { p_end: string; p_start: string }
        Returns: {
          avg_pages: number
          bounce_rate: number
          signups: number
          source: string
          visitors: number
          visits: number
        }[]
      }
      admin_user_list: {
        Args: { p_churn_days?: number; p_search?: string; p_segment?: string }
        Returns: {
          activity_count: number
          email: string
          full_name: string
          last_active: string
          plan: string
          session_count: number
          signup_date: string
          status: string
          user_id: string
        }[]
      }
      admin_user_timeline: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          kind: string
          label: string
          ts: string
        }[]
      }
      calculate_duration: {
        Args: { entry_time: string; exit_time: string }
        Returns: string
      }
      calculate_level_from_streak: {
        Args: { daily_streak: number }
        Returns: number
      }
      check_subscription: { Args: never; Returns: boolean }
      get_trade_duration: {
        Args: { entry_date: string; exit_date: string }
        Returns: string
      }
      get_week_number_in_month: {
        Args: { check_date: string }
        Returns: number
      }
      has_active_subscription: { Args: { user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
