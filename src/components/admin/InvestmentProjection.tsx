import { useMemo, useState } from "react";
import {
  simulateCopyTrading,
  defaultSimConfig,
  fmtMoney,
  fmtPct,
  type RawTrade,
  type SimConfig,
  type SizingMethod,
} from "@/lib/traderMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const methodLabels: Record<SizingMethod, string> = {
  risk_r: "Match trader's risk (R-multiples)",
  fixed_dollar: "Fixed dollar amount per trade",
  percent_balance: "Fixed % of simulated balance",
};

export function InvestmentProjection({ trades }: { trades: RawTrade[] }) {
  const [cfg, setCfg] = useState<SimConfig>({ ...defaultSimConfig, startingCapital: 100_000 });
  const set = <K extends keyof SimConfig>(k: K, v: SimConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  const sim = useMemo(() => simulateCopyTrading(trades, cfg), [trades, cfg]);

  const { years, annualPct, annualValue, totalPct, spanYears, byYear } = useMemo(() => {
    const pts = sim.points;
    if (pts.length === 0) {
      return { years: 0, annualPct: null as number | null, annualValue: null as number | null, totalPct: 0, spanYears: 0, byYear: [] as { year: string; pnl: number; trades: number }[] };
    }
    const first = new Date(pts[0].ts).getTime();
    const last = new Date(pts[pts.length - 1].ts).getTime();
    const span = Math.max((last - first) / (365.25 * 86_400_000), 1 / 365.25);
    const total = (sim.endingBalance - cfg.startingCapital) / cfg.startingCapital;
    const growth = sim.endingBalance / cfg.startingCapital;
    const cagr = growth > 0 ? (Math.pow(growth, 1 / span) - 1) * 100 : null;

    const map = new Map<string, { pnl: number; trades: number }>();
    for (const p of pts) {
      const y = String(new Date(p.ts).getUTCFullYear());
      const cur = map.get(y) ?? { pnl: 0, trades: 0 };
      cur.pnl += p.pnl;
      cur.trades += 1;
      map.set(y, cur);
    }

    return {
      years: span,
      annualPct: cagr,
      annualValue: cagr === null ? null : cfg.startingCapital * (cagr / 100),
      totalPct: total * 100,
      spanYears: span,
      byYear: [...map.entries()].map(([year, v]) => ({ year, ...v })).sort((a, b) => a.year.localeCompare(b.year)),
    };
  }, [sim, cfg.startingCapital]);

  return (
    <Card className="border-amber-500/40 bg-amber-500/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          If I invested {fmtMoney(cfg.startingCapital)} — annualised return
          <Badge variant="outline" className="border-amber-500/60 text-amber-500">HYPOTHETICAL</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-amber-500/40">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Back-tested, not realised</AlertTitle>
          <AlertDescription className="text-sm">
            This replays the trader's self-reported journal history against your capital and sizing rules,
            then annualises the result over the {years.toFixed(2)}-year period they actually traded. It is
            gross of fees, commissions, swaps and taxes, assumes every trade could have been mirrored, and
            past results do not predict future returns. Short histories make the annualised figure very
            unstable.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Amount invested ($)</Label>
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
          {cfg.method === "risk_r" ? (
            <div className="space-y-1.5">
              <Label>Risk per trade (%)</Label>
              <Input type="number" min={0} step={0.25} value={cfg.riskPercent}
                onChange={(e) => set("riskPercent", Math.max(0, Number(e.target.value) || 0))} />
            </div>
          ) : cfg.method === "fixed_dollar" ? (
            <div className="space-y-1.5">
              <Label>Notional per trade ($)</Label>
              <Input type="number" min={0} value={cfg.fixedDollar}
                onChange={(e) => set("fixedDollar", Math.max(0, Number(e.target.value) || 0))} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Notional per trade (% of balance)</Label>
              <Input type="number" min={0} step={1} value={cfg.percentBalance}
                onChange={(e) => set("percentBalance", Math.max(0, Number(e.target.value) || 0))} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Slippage (bps, round trip)</Label>
            <Input type="number" min={0} step={0.5} value={cfg.slippageBps}
              onChange={(e) => set("slippageBps", Math.max(0, Number(e.target.value) || 0))} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat
            label="Annual return (CAGR)"
            value={annualPct === null ? "—" : fmtPct(annualPct)}
            tone={(annualPct ?? 0) >= 0 ? "up" : "down"}
          />
          <Stat
            label="Annual return in dollars"
            value={annualValue === null ? "—" : fmtMoney(annualValue)}
            hint={`per year on ${fmtMoney(cfg.startingCapital)}`}
            tone={(annualValue ?? 0) >= 0 ? "up" : "down"}
          />
          <Stat
            label="Total return over period"
            value={fmtPct(totalPct)}
            hint={`${fmtMoney(sim.endingBalance - cfg.startingCapital)} in ${spanYears.toFixed(2)} yrs`}
            tone={totalPct >= 0 ? "up" : "down"}
          />
          <Stat
            label="Ending balance"
            value={fmtMoney(sim.endingBalance)}
            hint={`max drawdown ${fmtMoney(sim.metrics.maxDrawdown)}`}
          />
        </div>

        {spanYears < 1 && sim.usedTrades > 0 && (
          <p className="text-xs text-muted-foreground">
            Note: this trader's history spans only {(spanYears * 12).toFixed(1)} months, so the annualised
            figure extrapolates a short sample across a full year and should be treated as indicative only.
          </p>
        )}

        {byYear.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Hypothetical P&amp;L by calendar year</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">P&amp;L</TableHead>
                  <TableHead className="text-right">% of {fmtMoney(cfg.startingCapital)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byYear.map((y) => (
                  <TableRow key={y.year}>
                    <TableCell className="font-medium">{y.year}</TableCell>
                    <TableCell className="text-right">{y.trades}</TableCell>
                    <TableCell className={cn("text-right font-medium", y.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {fmtMoney(y.pnl)}
                    </TableCell>
                    <TableCell className="text-right">
                      {cfg.startingCapital ? fmtPct((y.pnl / cfg.startingCapital) * 100) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {sim.usedTrades === 0 && (
          <p className="text-sm text-muted-foreground">
            No trades in this trader's history carry enough price data to replay under this sizing method.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold tracking-tight mt-1", tone === "up" && "text-emerald-500", tone === "down" && "text-rose-500")}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
