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


/* ------------------------------------------------------------------ */
/* Full-funnel analytics                                               */
/* ------------------------------------------------------------------ */

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

function rangeQuery<T>(key: string, range: DateRange, fn: (s: string, e: string) => Promise<T>) {
  const start = fmt(range.from);
  const end = fmt(range.to);
  return { queryKey: ["admin", key, start, end], queryFn: () => fn(start, end), staleTime: 60 * 1000 };
}

export type Acquisition = {
  visits: number;
  visitors: number;
  new_visitors: number;
  pageviews: number;
  signups: number;
  anon_visits: number;
  tracked_visitors: number;
};

export function useAdminAcquisition(range: DateRange) {
  return useQuery(
    rangeQuery("acquisition", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_acquisition", { p_start, p_end });
      if (error) throw error;
      return data as unknown as Acquisition;
    })
  );
}

export type TrafficSource = {
  source: string;
  visits: number;
  visitors: number;
  signups: number;
  bounce_rate: number | null;
  avg_pages: number | null;
};

export function useAdminTrafficSources(range: DateRange) {
  return useQuery(
    rangeQuery("traffic-sources", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_traffic_sources", { p_start, p_end });
      if (error) throw error;
      return (data ?? []) as TrafficSource[];
    })
  );
}

export type LandingPage = {
  path: string;
  visits: number;
  bounce_rate: number | null;
  avg_pages: number | null;
  avg_seconds: number | null;
  signups: number;
};

export function useAdminLandingPages(range: DateRange) {
  return useQuery(
    rangeQuery("landing-pages", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_landing_pages", { p_start, p_end, p_limit: 15 });
      if (error) throw error;
      return (data ?? []) as LandingPage[];
    })
  );
}

export type Referrer = { referrer: string; visits: number; visitors: number; signups: number };

export function useAdminTopReferrers(range: DateRange) {
  return useQuery(
    rangeQuery("top-referrers", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_top_referrers", { p_start, p_end, p_limit: 15 });
      if (error) throw error;
      return (data ?? []) as Referrer[];
    })
  );
}

export type EngagementQuality = {
  sessions: number;
  avg_duration_sec: number;
  median_duration_sec: number;
  pages_per_session: number;
  bounce_rate: number;
};

export function useAdminEngagementQuality(range: DateRange) {
  return useQuery(
    rangeQuery("engagement-quality", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_engagement_quality", { p_start, p_end });
      if (error) throw error;
      return data as unknown as EngagementQuality;
    })
  );
}

export type PageBounce = { path: string; entries: number; bounce_rate: number | null; avg_seconds: number | null };

export function useAdminPageBounce(range: DateRange) {
  return useQuery(
    rangeQuery("page-bounce", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_page_bounce", { p_start, p_end, p_limit: 12 });
      if (error) throw error;
      return (data ?? []) as PageBounce[];
    })
  );
}

export type DeviceRow = {
  device: string;
  sessions: number;
  visitors: number;
  avg_seconds: number | null;
  pages_per_session: number | null;
  bounce_rate: number | null;
  signups: number;
};

export function useAdminDeviceBreakdown(range: DateRange) {
  return useQuery(
    rangeQuery("device-breakdown", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_device_breakdown", { p_start, p_end });
      if (error) throw error;
      return (data ?? []) as DeviceRow[];
    })
  );
}

export type SignupFunnel = {
  visitors: number;
  signups: number;
  journaled: number;
  second_session: number;
  paid: number;
  methods: { method: string; users: number }[];
  time_to_signup: { bucket: string; users: number }[];
};

export function useAdminSignupFunnel(range: DateRange) {
  return useQuery(
    rangeQuery("signup-funnel", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_signup_funnel", { p_start, p_end });
      if (error) throw error;
      return data as unknown as SignupFunnel;
    })
  );
}

export type Activation = {
  cohort: number;
  entry_24h: number;
  entry_7d: number;
  entry_ever: number;
  backtest_7d: number;
  second_session_7d: number;
  never_active: number;
  signed_up_never_journaled: number;
  median_hours_to_first_entry: number;
};

export function useAdminActivation(range: DateRange) {
  return useQuery(
    rangeQuery("activation", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_activation", { p_start, p_end });
      if (error) throw error;
      return data as unknown as Activation;
    })
  );
}

export type RetentionDn = {
  cohort: number;
  d1: number;
  d7: number;
  d30: number;
  weekly_active: { week: string; users: number }[];
  active_users: number;
  entries_per_active_user: number;
};

export function useAdminRetentionDn(range: DateRange) {
  return useQuery(
    rangeQuery("retention-dn", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_retention_dn", { p_start, p_end });
      if (error) throw error;
      return data as unknown as RetentionDn;
    })
  );
}

export type Monetization = {
  total_users: number;
  paying_users: number;
  free_to_paid_rate: number;
  avg_days_to_upgrade: number;
  median_days_to_upgrade: number;
  mrr: number;
  currency: string;
  prices_configured: number;
  mrr_trend: { month: string; mrr: number }[];
  upgrade_sources: { source: string; clicks: number; users: number }[];
};

export function useAdminMonetization(range: DateRange) {
  return useQuery(
    rangeQuery("monetization", range, async (p_start, p_end) => {
      const { data, error } = await supabase.rpc("admin_monetization", { p_start, p_end });
      if (error) throw error;
      return data as unknown as Monetization;
    })
  );
}

export type PlanPrice = {
  price_id: string;
  nickname: string | null;
  unit_amount: number;
  currency: string;
  interval: string;
};

export function useAdminPlanPrices() {
  return useQuery({
    queryKey: ["admin", "plan-prices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plan_prices").select("*").order("price_id");
      if (error) throw error;
      return (data ?? []) as PlanPrice[];
    },
  });
}

export type AdCampaign = {
  id: string;
  name: string;
  channel: string;
  utm_campaign: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  start_date: string | null;
  end_date: string | null;
};

export function useAdminAdCampaigns() {
  return useQuery({
    queryKey: ["admin", "ad-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ad_campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdCampaign[];
    },
  });
}
