import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

export type DateRange = { from: Date; to: Date };
export type Segment = "all" | "subscribed" | "free";

export function useAdminKPIs(range: DateRange) {
  const start = format(range.from, "yyyy-MM-dd");
  const end = format(range.to, "yyyy-MM-dd");
  return useQuery({
    queryKey: ["admin", "kpis", start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_kpis_range", {
        p_start: start,
        p_end: end,
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

export const defaultRange: DateRange = {
  from: subDays(new Date(), 29),
  to: new Date(),
};
