import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useTraderStats, useTraderTrades } from "@/hooks/useTraderAnalytics";
import {
  computeMetrics, equityCurve, monthlyBreakdown, fmtMoney, fmtNum, fmtPct,
} from "@/lib/traderMetrics";
import { CopyTradeSimulator } from "@/components/admin/CopyTradeSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const safeDate = (v: string | null, fmt = "MMM d, yyyy HH:mm") => {
  if (!v) return "—";
  try { return format(parseISO(v), fmt); } catch { return v; }
};

export default function TraderDetail() {
  const { userId } = useParams<{ userId: string }>();
  const stats = useTraderStats();
  const tradesQ = useTraderTrades(userId);

  const summary = stats.data?.find((r) => r.user_id === userId);
  const trades = tradesQ.data ?? [];

  const points = useMemo(
    () => trades.filter((t) => t.pnl !== null).map((t) => ({ ts: t.ts, pnl: Number(t.pnl) })),
    [trades]
  );
  const metrics = useMemo(() => computeMetrics(points), [points]);
  const curve = useMemo(() => equityCurve(points), [points]);
  const months = useMemo(() => monthlyBreakdown(points), [points]);

  const loading = stats.isLoading || tradesQ.isLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const missingPnl = trades.filter((t) => t.pnl === null).length;
  const missingExit = trades.filter((t) => !t.exit_price).length;
  const missingStop = trades.filter((t) => !t.stop_loss).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/traders" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {summary?.full_name || summary?.email || "Trader"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {summary?.email} · {metrics.trades} scored trades ·{" "}
            {safeDate(metrics.firstTs, "MMM d, yyyy")} – {safeDate(metrics.lastTs, "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Data quality for this trader</AlertTitle>
        <AlertDescription className="text-sm">
          {trades.length} logged trades. {missingPnl} without P&amp;L (excluded from all metrics),{" "}
          {missingExit} without an exit price, {missingStop} without a stop loss.
          P&amp;L is self-reported and gross of fees. Return-on-capital and risk-as-%-of-balance are{" "}
          <strong>unavailable</strong> — no account balance is stored.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Metric label="Net P&L" value={fmtMoney(metrics.netPnl)} tone={metrics.netPnl >= 0 ? "up" : "down"} />
        <Metric label="% return on capital" value="Unavailable" hint="No balance data" />
        <Metric label="Win rate" value={fmtPct(metrics.winRate)} hint={`${metrics.wins}W / ${metrics.losses}L`} />
        <Metric label="Profit factor" value={fmtNum(metrics.profitFactor)} hint="Gross profit ÷ gross loss" />
        <Metric label="Avg win : avg loss" value={fmtNum(metrics.winLossRatio)} hint={`${fmtMoney(metrics.avgWin)} vs ${fmtMoney(metrics.avgLoss)}`} />
        <Metric label="Max drawdown" value={fmtMoney(metrics.maxDrawdown)} tone="down" hint={metrics.maxDrawdownDays !== null ? `lasted ${metrics.maxDrawdownDays} days` : undefined} />
        <Metric label="Trading frequency" value={`${fmtNum(metrics.tradesPerWeek, 1)}/wk`} hint={`${fmtNum(metrics.tradesPerMonth, 1)} per month`} />
        <Metric label="Longest win streak" value={String(metrics.longestWinStreak)} />
        <Metric label="Longest loss streak" value={String(metrics.longestLossStreak)} tone="down" />
        <Metric
          label="Profitable months"
          value={`${metrics.profitableMonths}/${metrics.monthsTraded}`}
          hint={fmtPct(metrics.consistency, 0) + " consistency"}
        />
        <Metric label="Avg risk per trade" value="Unavailable" hint="Position size % needs balance data" />
        <Metric label="Best / worst month" value={`${fmtMoney(metrics.bestMonth)} / ${fmtMoney(metrics.worstMonth)}`} />
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardHeader><CardTitle>Equity curve (cumulative self-reported P&amp;L)</CardTitle></CardHeader>
        <CardContent className="h-80">
          {curve.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scored trades.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="ts" tick={{ fontSize: 11 }} tickFormatter={(v) => safeDate(v, "MMM d")} />
                <YAxis tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(v: number) => [fmtMoney(v), "Cumulative P&L"]}
                  labelFormatter={(v) => safeDate(String(v))}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardHeader><CardTitle>Monthly P&amp;L (consistency check)</CardTitle></CardHeader>
        <CardContent className="h-64">
          {months.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scored trades.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(v: number, _n, p) => [fmtMoney(v), `P&L (${p.payload.trades} trades)`]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {months.map((m) => (
                    <Cell key={m.month} fill={m.pnl >= 0 ? "hsl(var(--primary))" : "hsl(0 72% 51%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <InvestmentProjection trades={trades} />

      <CopyTradeSimulator trades={trades} actual={metrics} actualEquity={curve} />


      <Card className="bg-card/60 border-border/60">
        <CardHeader><CardTitle>Trade log ({trades.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Exit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Stop</TableHead>
                <TableHead className="text-right">R</TableHead>
                <TableHead className="text-right">P&amp;L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((t) => {
                const stopDist = t.entry_price && t.stop_loss ? Math.abs(t.entry_price - t.stop_loss) : null;
                const move = t.entry_price && t.exit_price ? Math.abs(t.exit_price - t.entry_price) : null;
                const r = stopDist && move && stopDist > 0 && t.pnl !== null
                  ? (t.pnl >= 0 ? 1 : -1) * (move / stopDist)
                  : null;
                return (
                  <TableRow key={t.trade_id}>
                    <TableCell className="whitespace-nowrap">{safeDate(t.ts, "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>{t.symbol ?? "—"}</TableCell>
                    <TableCell>
                      {t.direction ? (
                        <Badge variant="outline" className={cn(t.direction === "buy" ? "text-emerald-500" : "text-rose-500")}>
                          {t.direction}
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{fmtNum(t.entry_price)}</TableCell>
                    <TableCell className="text-right">{fmtNum(t.exit_price)}</TableCell>
                    <TableCell className="text-right">{fmtNum(t.quantity)}</TableCell>
                    <TableCell className="text-right">{fmtNum(t.stop_loss)}</TableCell>
                    <TableCell className="text-right">{r === null ? "—" : `${r > 0 ? "+" : ""}${fmtNum(r, 2)}R`}</TableCell>
                    <TableCell className={cn("text-right font-medium", (t.pnl ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {t.pnl === null ? "—" : fmtMoney(t.pnl)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn(
          "text-xl font-bold tracking-tight mt-1",
          tone === "up" && "text-emerald-500",
          tone === "down" && "text-rose-500",
          value === "Unavailable" && "text-muted-foreground text-base font-medium"
        )}>
          {value}
        </div>
        {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}
