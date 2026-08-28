import { useMemo, useState } from "react";
import {
  simulateCopyTrading,
  defaultSimConfig,
  fmtMoney,
  fmtNum,
  fmtPct,
  type RawTrade,
  type SimConfig,
  type SizingMethod,
  type TraderMetrics,
} from "@/lib/traderMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { FlaskConical, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const methodLabels: Record<SizingMethod, string> = {
  risk_r: "Match trader's risk (R-multiples)",
  fixed_dollar: "Fixed dollar amount per trade",
  percent_balance: "Fixed % of simulated balance",
};

export function CopyTradeSimulator({
  trades,
  actual,
  actualEquity,
}: {
  trades: RawTrade[];
  actual: TraderMetrics;
  actualEquity: { ts: string; equity: number }[];
}) {
  const [cfg, setCfg] = useState<SimConfig>(defaultSimConfig);
  const set = <K extends keyof SimConfig>(k: K, v: SimConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  const sim = useMemo(() => simulateCopyTrading(trades, cfg), [trades, cfg]);

  const chartData = useMemo(() => {
    const byTs = new Map<string, { ts: string; simulated?: number; trader?: number }>();
    sim.equity.forEach((p) => byTs.set(p.ts, { ...(byTs.get(p.ts) ?? { ts: p.ts }), simulated: p.equity }));
    actualEquity.forEach((p) => byTs.set(p.ts, { ...(byTs.get(p.ts) ?? { ts: p.ts }), trader: p.equity }));
    return [...byTs.values()].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  }, [sim.equity, actualEquity]);

  const returnPct = ((sim.endingBalance - cfg.startingCapital) / cfg.startingCapital) * 100;
  const ddPct = cfg.startingCapital ? (sim.metrics.maxDrawdown / cfg.startingCapital) * 100 : 0;

  const rows: { label: string; actual: string; simulated: string }[] = [
    { label: "Net P&L", actual: fmtMoney(actual.netPnl), simulated: fmtMoney(sim.metrics.netPnl) },
    { label: "Trades used", actual: String(actual.trades), simulated: String(sim.usedTrades) },
    { label: "Win rate", actual: fmtPct(actual.winRate), simulated: fmtPct(sim.metrics.winRate) },
    { label: "Profit factor", actual: fmtNum(actual.profitFactor), simulated: fmtNum(sim.metrics.profitFactor) },
    { label: "Avg win", actual: fmtMoney(actual.avgWin), simulated: fmtMoney(sim.metrics.avgWin) },
    { label: "Avg loss", actual: fmtMoney(actual.avgLoss), simulated: fmtMoney(sim.metrics.avgLoss) },
    { label: "Max drawdown", actual: fmtMoney(actual.maxDrawdown), simulated: fmtMoney(sim.metrics.maxDrawdown) },
    { label: "Longest loss streak", actual: String(actual.longestLossStreak), simulated: String(sim.metrics.longestLossStreak) },
  ];

  return (
    <Card className="border-amber-500/40 bg-amber-500/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-500" />
          Copy-trading simulator
          <Badge variant="outline" className="border-amber-500/60 text-amber-500">HYPOTHETICAL</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-amber-500/40">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>These are not real trades</AlertTitle>
          <AlertDescription className="text-sm">
            Every figure below is a hypothetical replay of this trader's journalled history under your
            sizing and slippage rules. It assumes the trader's self-reported P&amp;L is accurate, that
            every trade could have been mirrored at the same time, and it excludes fees, commissions,
            swaps and financing costs.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Starting capital ($)</Label>
            <Input
              type="number" min={0} value={cfg.startingCapital}
              onChange={(e) => set("startingCapital", Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Position sizing method</Label>
            <Select value={cfg.method} onValueChange={(v) => set("method", v as SizingMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(methodLabels) as SizingMethod[]).map((m) => (
                  <SelectItem key={m} value={m}>{methodLabels[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cfg.method === "risk_r" && (
            <div className="space-y-1.5">
              <Label>Risk per trade (% of balance)</Label>
              <Input
                type="number" min={0} step={0.25} value={cfg.riskPercent}
                onChange={(e) => set("riskPercent", Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          )}
          {cfg.method === "fixed_dollar" && (
            <div className="space-y-1.5">
              <Label>Notional per trade ($)</Label>
              <Input
                type="number" min={0} value={cfg.fixedDollar}
                onChange={(e) => set("fixedDollar", Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          )}
          {cfg.method === "percent_balance" && (
            <div className="space-y-1.5">
              <Label>Notional per trade (% of balance)</Label>
              <Input
                type="number" min={0} step={1} value={cfg.percentBalance}
                onChange={(e) => set("percentBalance", Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Slippage (bps, round trip)</Label>
            <Input
              type="number" min={0} step={0.5} value={cfg.slippageBps}
              onChange={(e) => set("slippageBps", Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Max position size ($, optional)</Label>
            <Input
              type="number" min={0} placeholder="No cap"
              value={cfg.maxPositionSize ?? ""}
              onChange={(e) =>
                set("maxPositionSize", e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>
        </div>

        {cfg.method === "risk_r" && (
          <p className="text-xs text-muted-foreground">
            The trader's own risk % is unknown (no account-balance data exists), so this method replays each
            trade as an R-multiple — how many multiples of its own stop distance it returned — sized at your
            chosen risk %. Trades without a stop loss are skipped.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Simulated ending balance" value={fmtMoney(sim.endingBalance)} tone={sim.endingBalance >= cfg.startingCapital ? "up" : "down"} />
          <Stat label="Simulated return" value={fmtPct(returnPct)} tone={returnPct >= 0 ? "up" : "down"} />
          <Stat label="Simulated max drawdown" value={`${fmtMoney(sim.metrics.maxDrawdown)} (${fmtPct(ddPct)})`} tone="down" />
          <Stat label="Trades replayed" value={`${sim.usedTrades} of ${trades.length}`} />
        </div>

        {sim.ruined && (
          <Alert variant="destructive">
            <AlertTitle>Simulated account was wiped out</AlertTitle>
            <AlertDescription>
              With these settings the company account hits zero before the trade history ends. Remaining
              trades after that point were not replayed.
            </AlertDescription>
          </Alert>
        )}

        {sim.skippedTrades > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{sim.skippedTrades} trades skipped</span> — missing
            data rather than assumed values:{" "}
            {Object.entries(sim.skipReasons).map(([reason, n], i) => (
              <span key={reason}>{i > 0 && "; "}{reason} ({n})</span>
            ))}
          </div>
        )}

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="ts" tick={{ fontSize: 11 }}
                tickFormatter={(v) => { try { return format(parseISO(v), "MMM d"); } catch { return v; } }}
              />
              <YAxis tick={{ fontSize: 11 }} width={80} />
              <Tooltip
                formatter={(v: number, name) => [fmtMoney(v), name === "simulated" ? "Simulated (hypothetical)" : "Trader (actual)"]}
                labelFormatter={(v) => { try { return format(parseISO(String(v)), "PPp"); } catch { return String(v); } }}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <Legend formatter={(v) => (v === "simulated" ? "Company account (hypothetical)" : "Trader's own cumulative P&L")} />
              <Line type="monotone" dataKey="simulated" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="trader" stroke="hsl(var(--muted-foreground))" dot={false} strokeWidth={1.5} strokeDasharray="4 4" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Actual vs. simulated</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Trader (actual, self-reported)</TableHead>
                <TableHead className="text-right">Company account (hypothetical)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.label}>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell className="text-right">{r.actual}</TableCell>
                  <TableCell className="text-right text-amber-500">{r.simulated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold tracking-tight mt-1", tone === "up" && "text-emerald-500", tone === "down" && "text-rose-500")}>
        {value}
      </div>
    </div>
  );
}
