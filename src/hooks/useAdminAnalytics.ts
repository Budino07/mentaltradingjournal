import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

export type DateRange = { from: Date; to: Date };
export type Segment = "all" | "subscribed" | "free";

export function useAdminKPIs(range: DateRange, segment: Segment = "all") {
  const start = format(range.from, "yyyy-MM-dd");
  const end = format(range.to, "yyyy-MM-dd");
  return useQuery({
    queryKey: ["admin", "kpis", start, end, segment],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_kpis_range", {
        p_start: start,
        p_end: end,
        p_segment: segment,
      });
      if (error) throw error;
      return data as unknown as Record<string, number>;
    },
    staleTime: 60 * 1000,
  });
}

export function useAdminGrowth(range: DateRange, bucket: "day" | "week" | "month") {
  return useQuery({
    queryKey: ["admin", "growth", format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd"), bucket],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_growth_series", {
        p_start: format(range.from, "yyyy-MM-dd"),
        p_end: format(range.to, "yyyy-MM-dd"),
        p_bucket: bucket,
      });
      if (error) throw error;
      return data as { bucket: string; signups: number; cumulative: number }[];
    },
  });
}

export function useAdminActiveUsers(range: DateRange) {
  return useQuery({
    queryKey: ["admin", "active-users", format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_active_users", {
        p_start: format(range.from, "yyyy-MM-dd"),
        p_end: format(range.to, "yyyy-MM-dd"),
      });
      if (error) throw error;
      return data as { day: string; dau: number; wau: number; mau: number }[];
    },
  });
}

export function useAdminSessions(range: DateRange) {
  return useQuery({
    queryKey: ["admin", "sessions", format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_sessions_series", {
        p_start: format(range.from, "yyyy-MM-dd"),
        p_end: format(range.to, "yyyy-MM-dd"),
      });
      if (error) throw error;
      return data as { day: string; sessions: number; avg_duration_sec: number }[];
    },
  });
}

export function useAdminFeatureUsage(range: DateRange) {
  return useQuery({
    queryKey: ["admin", "feature-usage", format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_feature_usage", {
        p_start: format(range.from, "yyyy-MM-dd"),
        p_end: format(range.to, "yyyy-MM-dd"),
      });
      if (error) throw error;
      return data as { feature: string; users: number; uses: number }[];
    },
  });
}

export function useAdminActivityBreakdown(range: DateRange) {
  return useQuery({
    queryKey: [
      "admin",
      "activity-breakdown",
      format(range.from, "yyyy-MM-dd"),
      format(range.to, "yyyy-MM-dd"),
    ],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_activity_breakdown", {
        p_start: format(range.from, "yyyy-MM-dd"),
        p_end: format(range.to, "yyyy-MM-dd"),
      });
      if (error) throw error;
      return data as {
        feature: string;
        kind: string;
        uses: number;
        users: number;
        total_seconds: number;
        avg_seconds: number;
        share: number;
      }[];
    },
    staleTime: 60 * 1000,
  });
}

export function useAdminCohortRetention() {
  return useQuery({
    queryKey: ["admin", "cohort-retention"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_cohort_retention", {
        p_cohorts: 8,
        p_periods: 8,
      });
      if (error) throw error;
      return data as { cohort: string; cohort_size: number; period: number; retained: number }[];
    },
  });
}

export function useAdminChurnTrend(weeks = 12) {
  return useQuery({
    queryKey: ["admin", "churn-trend", weeks],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_churn_trend", { p_weeks: weeks });
      if (error) throw error;
      return data as { week: string; churn_rate: number; churned: number; base: number }[];
    },
  });
}

export function useAdminUserList(search: string, segment: Segment, churnDays: number) {
  return useQuery({
    queryKey: ["admin", "users", search, segment, churnDays],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_user_list", {
        p_search: search || null,
        p_segment: segment,
        p_churn_days: churnDays,
      });
      if (error) throw error;
      return data as {
        user_id: string;
        email: string;
        full_name: string | null;
        signup_date: string;
        last_active: string | null;
        session_count: number;
        activity_count: number;
        plan: string;
        status: string;
      }[];
    },
  });
}

export function useAdminUserTimeline(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "timeline", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.rpc("admin_user_timeline", {
        p_user_id: userId,
        p_limit: 200,
      });
      if (error) throw error;
      return data as { ts: string; kind: string; label: string }[];
    },
    enabled: !!userId,
  });
}

export type SubscriptionStats = {
  by_plan: {
    plan: string;
    total: number;
    churned: number;
    active: number;
    avg_months_churned: number | null;
    median_months_churned: number | null;
    avg_months_active: number | null;
    avg_months_all: number | null;
    max_months_churned: number | null;
  }[];
  distribution: { plan: string; bucket: string; subs: number }[];
  survival: { month: number; surviving: number; cohort: number; pct: number }[];
  totals: {
    subscriptions: number;
    subscribers: number;
    repeat_subscribers: number;
    avg_months_monthly_churned: number | null;
    median_months_monthly_churned: number | null;
  };
};

export function useAdminSubscriptionStats() {
  return useQuery({
    queryKey: ["admin", "subscription-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_subscription_stats");
      if (error) throw error;
      return data as unknown as SubscriptionStats;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export type CancellationReasonRow = {
  reason: string;
  cancels: number;
  users: number;
  share: number;
  avg_months: number;
};

export function useAdminCancellationReasons(range: DateRange) {
  const start = format(range.from, "yyyy-MM-dd");
  const end = format(range.to, "yyyy-MM-dd");
  return useQuery({
    queryKey: ["admin", "cancellation-reasons", start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_cancellation_reasons" as never, {
        p_start: start,
        p_end: end,
      } as never);
      if (error) throw error;
      return (data ?? []) as unknown as CancellationReasonRow[];
    },
    staleTime: 60 * 1000,
  });
}

export type CancellationComment = { canceled_at: string; reason: string; comment: string | null };

export function useAdminCancellationComments(range: DateRange, limit = 50) {
  const start = format(range.from, "yyyy-MM-dd");
  const end = format(range.to, "yyyy-MM-dd");
  return useQuery({
    queryKey: ["admin", "cancellation-comments", start, end, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_cancellation_comments" as never, {
        p_start: start,
        p_end: end,
        p_limit: limit,
      } as never);
      if (error) throw error;
      return (data ?? []) as unknown as CancellationComment[];
    },
    staleTime: 60 * 1000,
  });
}


export const defaultRange: DateRange = {
  from: subDays(new Date(), 29),
  to: new Date(),
};

