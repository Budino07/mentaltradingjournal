import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { computeMetrics, type PnlPoint, type RawTrade, type TraderMetrics } from "@/lib/traderMetrics";

/** RPCs are admin-gated server-side; these types aren't in the generated schema yet. */
const rpc = (name: string, args?: Record<string, unknown>) =>
  (supabase as unknown as { rpc: (n: string, a?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> }).rpc(name, args);

export interface TraderStatRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  total_rows: number;
  missing_pnl: number;
  missing_exit: number;
  missing_stop: number;
  points: PnlPoint[];
}

export interface TraderSummary extends TraderStatRow {
  metrics: TraderMetrics;
}

export function useTraderStats(start?: string, end?: string) {
  return useQuery({
    queryKey: ["trader-stats", start, end],
    queryFn: async (): Promise<TraderSummary[]> => {
      const { data, error } = await rpc("admin_trader_stats", {
        p_start: start ?? "2000-01-01",
        p_end: end ?? "2999-01-01",
      });
      if (error) throw new Error(error.message);
      return ((data as TraderStatRow[]) ?? []).map((row) => ({
        ...row,
        points: Array.isArray(row.points) ? row.points : [],
        metrics: computeMetrics(Array.isArray(row.points) ? row.points : []),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTraderTrades(userId?: string) {
  return useQuery({
    queryKey: ["trader-trades", userId],
    queryFn: async (): Promise<RawTrade[]> => {
      const { data, error } = await rpc("admin_trader_trades", { p_user_id: userId });
      if (error) throw new Error(error.message);
      return (data as RawTrade[]) ?? [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/** True only for the single capital-allocation admin account. */
export function useIsCapitalAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["is-capital-admin"],
    queryFn: async () => {
      const { data, error } = await rpc("is_capital_admin");
      if (error) return false;
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return { allowed: !!data, loading: isLoading };
}
