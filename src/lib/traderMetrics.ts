/**
 * Shared trader performance math.
 * Used by both the admin leaderboard and the copy-trading simulator so the
 * two never disagree on how a metric is defined.
 *
 * IMPORTANT: all P&L values are SELF-REPORTED by the trader in their journal
 * and are GROSS of fees/commissions (the app never captured those fields).
 */

export interface PnlPoint {
  ts: string;
  pnl: number;
}

export interface RawTrade {
  trade_id: string;
  ts: string;
  entry_ts: string | null;
  symbol: string | null;
  direction: string | null;
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  pnl: number | null;
  setup: string | null;
  notes: string | null;
}

export interface TraderMetrics {
  trades: number;
  netPnl: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  avgWin: number;
  avgLoss: number;
  winLossRatio: number | null;
  maxDrawdown: number;
  maxDrawdownDays: number | null;
  longestWinStreak: number;
  longestLossStreak: number;
  firstTs: string | null;
  lastTs: string | null;
  tradesPerWeek: number;
  tradesPerMonth: number;
  monthsTraded: number;
  profitableMonths: number;
  consistency: number;
  bestMonth: number;
  worstMonth: number;
}

export interface MonthPnl {
  month: string;
  pnl: number;
  trades: number;
}

export interface EquityPoint {
  ts: string;
  equity: number;
  pnl: number;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

export function sortPoints(points: PnlPoint[]): PnlPoint[] {
  return [...points]
    .map((p) => ({ ts: p.ts, pnl: num(p.pnl) ?? 0 }))
    .filter((p) => !!p.ts)
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

export function equityCurve(points: PnlPoint[], start = 0): EquityPoint[] {
  let eq = start;
  return sortPoints(points).map((p) => {
    eq += p.pnl;
    return { ts: p.ts, equity: eq, pnl: p.pnl };
  });
}

export function monthlyBreakdown(points: PnlPoint[]): MonthPnl[] {
  const map = new Map<string, { pnl: number; trades: number }>();
  for (const p of sortPoints(points)) {
    const d = new Date(p.ts);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const cur = map.get(key) ?? { pnl: 0, trades: 0 };
    cur.pnl += p.pnl;
    cur.trades += 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function computeMetrics(rawPoints: PnlPoint[]): TraderMetrics {
  const points = sortPoints(rawPoints);
  const n = points.length;

  const empty: TraderMetrics = {
    trades: 0, netPnl: 0, wins: 0, losses: 0, breakeven: 0, winRate: 0,
    grossProfit: 0, grossLoss: 0, profitFactor: null, avgWin: 0, avgLoss: 0,
    winLossRatio: null, maxDrawdown: 0, maxDrawdownDays: null,
    longestWinStreak: 0, longestLossStreak: 0, firstTs: null, lastTs: null,
    tradesPerWeek: 0, tradesPerMonth: 0, monthsTraded: 0, profitableMonths: 0,
    consistency: 0, bestMonth: 0, worstMonth: 0,
  };
  if (n === 0) return empty;

  let netPnl = 0, grossProfit = 0, grossLoss = 0;
  let wins = 0, losses = 0, breakeven = 0;
  let winStreak = 0, lossStreak = 0, longestWinStreak = 0, longestLossStreak = 0;
  let peak = 0, peakTs = points[0].ts, equity = 0;
  let maxDrawdown = 0, ddStartTs: string | null = null, ddEndTs: string | null = null;

  for (const p of points) {
    netPnl += p.pnl;
    equity += p.pnl;

    if (p.pnl > 0) {
      grossProfit += p.pnl;
      wins += 1;
      winStreak += 1; lossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, winStreak);
    } else if (p.pnl < 0) {
      grossLoss += Math.abs(p.pnl);
      losses += 1;
      lossStreak += 1; winStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, lossStreak);
    } else {
      breakeven += 1;
    }

    if (equity > peak) {
      peak = equity;
      peakTs = p.ts;
    }
    const dd = peak - equity;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
      ddStartTs = peakTs;
      ddEndTs = p.ts;
    }
  }

  const months = monthlyBreakdown(points);
  const first = points[0].ts;
  const last = points[n - 1].ts;
  const spanDays = Math.max(
    (new Date(last).getTime() - new Date(first).getTime()) / 86_400_000,
    1
  );

  const maxDrawdownDays =
    ddStartTs && ddEndTs
      ? Math.round(
          (new Date(ddEndTs).getTime() - new Date(ddStartTs).getTime()) / 86_400_000
        )
      : null;

  const avgWin = wins ? grossProfit / wins : 0;
  const avgLoss = losses ? grossLoss / losses : 0;

  return {
    trades: n,
    netPnl,
    wins,
    losses,
    breakeven,
    winRate: n ? (wins / n) * 100 : 0,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : null,
    avgWin,
    avgLoss,
    winLossRatio: avgLoss > 0 ? avgWin / avgLoss : null,
    maxDrawdown,
    maxDrawdownDays,
    longestWinStreak,
    longestLossStreak,
    firstTs: first,
    lastTs: last,
    tradesPerWeek: (n / spanDays) * 7,
    tradesPerMonth: (n / spanDays) * 30.44,
    monthsTraded: months.length,
    profitableMonths: months.filter((m) => m.pnl > 0).length,
    consistency: months.length
      ? (months.filter((m) => m.pnl > 0).length / months.length) * 100
      : 0,
    bestMonth: months.length ? Math.max(...months.map((m) => m.pnl)) : 0,
    worstMonth: months.length ? Math.min(...months.map((m) => m.pnl)) : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Copy-trading simulator (HYPOTHETICAL)                               */
/* ------------------------------------------------------------------ */

export type SizingMethod = "risk_r" | "fixed_dollar" | "percent_balance";

export interface SimConfig {
  startingCapital: number;
  method: SizingMethod;
  /** risk_r: % of current simulated balance risked per trade */
  riskPercent: number;
  /** fixed_dollar: notional dollars deployed per trade */
  fixedDollar: number;
  /** percent_balance: % of current simulated balance deployed as notional */
  percentBalance: number;
  /** round-trip slippage in basis points of notional */
  slippageBps: number;
  /** optional cap on simulated notional per trade */
  maxPositionSize: number | null;
}

export interface SimResult {
  points: PnlPoint[];
  equity: EquityPoint[];
  metrics: TraderMetrics;
  endingBalance: number;
  usedTrades: number;
  skippedTrades: number;
  skipReasons: Record<string, number>;
  ruined: boolean;
}

export const defaultSimConfig: SimConfig = {
  startingCapital: 50_000,
  method: "percent_balance",
  riskPercent: 1,
  fixedDollar: 10_000,
  percentBalance: 20,
  slippageBps: 7.5,
  maxPositionSize: null,
};

/**
 * Runs a trader's real trade history through company-capital sizing rules.
 * Everything this returns is HYPOTHETICAL.
 *
 * Because the app never stored account balance or contract point-value, the
 * simulator works off each trade's implied return: the trader's reported P&L
 * divided by their own notional (entry price x quantity x implied point value,
 * which cancels out). Trades missing the fields a method needs are skipped and
 * reported rather than guessed at.
 */
export function simulateCopyTrading(trades: RawTrade[], cfg: SimConfig): SimResult {
  const ordered = [...trades]
    .filter((t) => !!t.ts)
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  let balance = cfg.startingCapital;
  const points: PnlPoint[] = [];
  const skipReasons: Record<string, number> = {};
  let skipped = 0;

  const skip = (reason: string) => {
    skipped += 1;
    skipReasons[reason] = (skipReasons[reason] ?? 0) + 1;
  };

  for (const t of ordered) {
    const pnl = num(t.pnl);
    const entry = num(t.entry_price);
    const exit = num(t.exit_price);
    const stop = num(t.stop_loss);

    if (pnl === null) { skip("No P&L recorded"); continue; }
    if (balance <= 0) { skip("Simulated account already wiped out"); continue; }

    let simNotional: number | null = null;
    let simPnl: number | null = null;

    if (cfg.method === "risk_r") {
      // R-multiple: how many multiples of the trade's own stop distance it made.
      if (entry === null || exit === null || stop === null) {
        skip("Needs entry, exit and stop price"); continue;
      }
      const stopDist = Math.abs(entry - stop);
      const moveDist = Math.abs(exit - entry);
      if (stopDist <= 0) { skip("Stop equals entry price"); continue; }
      const r = (pnl >= 0 ? 1 : -1) * (moveDist / stopDist);
      const riskDollars = balance * (cfg.riskPercent / 100);
      simPnl = r * riskDollars;
      // notional implied by the risk allocation, for slippage costing
      simNotional = riskDollars * (entry / stopDist);
    } else {
      if (entry === null || exit === null) {
        skip("Needs entry and exit price"); continue;
      }
      const move = Math.abs(exit - entry);
      if (entry <= 0 || move <= 0) { skip("Entry and exit are identical"); continue; }
      const returnPct = (pnl >= 0 ? 1 : -1) * (move / entry);
      simNotional =
        cfg.method === "fixed_dollar"
          ? cfg.fixedDollar
          : balance * (cfg.percentBalance / 100);
      simPnl = simNotional * returnPct;
    }

    if (cfg.maxPositionSize && simNotional && simNotional > cfg.maxPositionSize) {
      const scale = cfg.maxPositionSize / simNotional;
      simNotional = cfg.maxPositionSize;
      simPnl = (simPnl ?? 0) * scale;
    }

    // Round-trip slippage charged against the mirrored account.
    const slippageCost = (simNotional ?? 0) * (cfg.slippageBps / 10_000);
    const net = (simPnl ?? 0) - slippageCost;

    balance += net;
    points.push({ ts: t.ts, pnl: net });
  }

  return {
    points,
    equity: equityCurve(points, cfg.startingCapital),
    metrics: computeMetrics(points),
    endingBalance: balance,
    usedTrades: points.length,
    skippedTrades: skipped,
    skipReasons,
    ruined: balance <= 0,
  };
}

export const fmtMoney = (v: number | null | undefined, currency = "$") => {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  const sign = v < 0 ? "-" : "";
  return `${sign}${currency}${Math.abs(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const fmtNum = (v: number | null | undefined, digits = 2) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "—"
    : v.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined || !Number.isFinite(v) ? "—" : `${v.toFixed(digits)}%`;
