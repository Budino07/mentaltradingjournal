import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtMoney, fmtPct, sortPoints, type PnlPoint } from "@/lib/traderMetrics";

interface Props {
  /** Every trader currently passing the leaderboard filters. */
  traders: { user_id: string; points: PnlPoint[] }[];
  /** Names shown to make the active multi-trader pool explicit. */
  selectedTraderNames?: string[];
}

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short", year: "2-digit", timeZone: "UTC",
  });
};

export function PropFirmReturns({ traders, selectedTraderNames = [] }: Props) {
  const [capital, setCapital] = useState(1_000_000);
  const [firmSplit, setFirmSplit] = useState(20); // % of trader profits the firm keeps
  const [compound, setCompound] = useState(true);

  const { months, years, summary } = useMemo(() => {
    // Aggregate every trader's realised P&L into a single firm-level book.
    const all: PnlPoint[] = sortPoints(traders.flatMap((t) => t.points ?? []));

    const monthMap = new Map<string, { pnl: number; trades: number }>();
    for (const p of all) {
      const d = new Date(p.ts);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const cur = monthMap.get(key) ?? { pnl: 0, trades: 0 };
      cur.pnl += p.pnl;
      cur.trades += 1;
      monthMap.set(key, cur);
    }

    const ordered = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Firm keeps `firmSplit`% of profitable months' P&L but eats 100% of losses.
    let equity = capital;
    const months = ordered.map(([key, v]) => {
      const base = compound ? equity : capital;
      const firmPnl = v.pnl >= 0 ? v.pnl * (firmSplit / 100) : v.pnl;
      const pct = base > 0 ? (firmPnl / base) * 100 : 0;
      equity += firmPnl;
      return {
        key,
        label: monthLabel(key),
        year: key.slice(0, 4),
        traderPnl: v.pnl,
        firmPnl,
        trades: v.trades,
        pct,
        equity,
        cumPct: capital > 0 ? ((equity - capital) / capital) * 100 : 0,
      };
    });

    const yearMap = new Map<string, { firmPnl: number; traderPnl: number; trades: number; opening: number; closing: number; wins: number; count: number }>();
    for (const m of months) {
      const cur = yearMap.get(m.year) ?? {
        firmPnl: 0, traderPnl: 0, trades: 0, opening: m.equity - m.firmPnl, closing: m.equity, wins: 0, count: 0,
      };
      cur.firmPnl += m.firmPnl;
      cur.traderPnl += m.traderPnl;
      cur.trades += m.trades;
      cur.closing = m.equity;
      cur.wins += m.firmPnl > 0 ? 1 : 0;
      cur.count += 1;
      yearMap.set(m.year, cur);
    }
    const years = [...yearMap.entries()]
      .map(([year, v]) => ({
        year,
        ...v,
        // Annual return is based on the year's opening and closing firm equity.
        pct: v.opening > 0 ? ((v.closing - v.opening) / v.opening) * 100 : 0,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const endEquity = months.length ? months[months.length - 1].equity : capital;
    const spanYears = Math.max(months.length / 12, 1 / 12);
    const growth = capital > 0 ? endEquity / capital : 0;
    const cagr = growth > 0 ? (Math.pow(growth, 1 / spanYears) - 1) * 100 : null;
    const positive = months.filter((m) => m.firmPnl > 0).length;

    const summary = {
      endEquity,
      totalPnl: endEquity - capital,
      totalPct: capital > 0 ? ((endEquity - capital) / capital) * 100 : 0,
      cagr,
      months: months.length,
      positive,
      hitRate: months.length ? (positive / months.length) * 100 : 0,
      best: months.reduce((a, m) => Math.max(a, m.pct), -Infinity),
      worst: months.reduce((a, m) => Math.min(a, m.pct), Infinity),
      avg: months.length ? months.reduce((a, m) => a + m.pct, 0) / months.length : 0,
    };

    return { months, years, summary };
  }, [traders, capital, firmSplit, compound]);

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Prop firm returns — monthly &amp; annual
          <Badge variant="outline">HYPOTHETICAL</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {selectedTraderNames.length > 0
            ? `Copy-trade simulation for ${selectedTraderNames.join(", ")}.`
            : "Every trader currently passing the minimum-trades filter is pooled into one firm book."} {" "}
          The firm keeps {firmSplit}% of profitable months and absorbs 100% of losing months. Self-reported, gross of fees.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Firm capital ($)</Label>
            <Input type="number" min={0} value={capital}
              onChange={(e) => setCapital(Math.max(0, Number(e.target.value) || 0))} />
          </div>
          <div className="space-y-1.5">
            <Label>Firm profit split (%)</Label>
            <Input type="number" min={0} max={100} value={firmSplit}
              onChange={(e) => setFirmSplit(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
          </div>
          <div className="space-y-1.5">
            <Label>Return basis</Label>
            <div className="flex gap-2">
              <Button type="button" variant={compound ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setCompound(true)}>
                Compounding
              </Button>
              <Button type="button" variant={!compound ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setCompound(false)}>
                Fixed base
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Traders pooled</Label>
            <div className="rounded-md border border-border/60 px-3 py-2 text-sm">
              {traders.length} traders · {summary.months} months
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Annualised return (CAGR)" value={summary.cagr === null ? "—" : fmtPct(summary.cagr)} tone={(summary.cagr ?? 0) >= 0 ? "up" : "down"} />
          <Stat label="Total return" value={fmtPct(summary.totalPct)} hint={fmtMoney(summary.totalPnl)} tone={summary.totalPct >= 0 ? "up" : "down"} />
          <Stat label="Avg month" value={fmtPct(summary.avg)} hint={`${summary.positive}/${summary.months} profitable (${summary.hitRate.toFixed(0)}%)`} tone={summary.avg >= 0 ? "up" : "down"} />
          <Stat label="Best / worst month" value={months.length ? `${fmtPct(summary.best)} / ${fmtPct(summary.worst)}` : "—"} hint={`ending equity ${fmtMoney(summary.endEquity)}`} />
        </div>

        {months.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No trades match the current filters.
          </p>
        ) : (
          <>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Monthly return (%) and cumulative return</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number, name: string) =>
                        name === "Firm P&L" ? fmtMoney(v) : `${Number(v).toFixed(2)}%`
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="pct" name="Monthly return" radius={[3, 3, 0, 0]}>
                      {months.map((m) => (
                        <Cell key={m.key} fill={m.pct >= 0 ? "hsl(152 60% 45%)" : "hsl(350 70% 55%)"} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Cumulative return" dot={false} strokeWidth={2} stroke="hsl(var(--primary))" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Annual return (%)</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={years} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => `${Number(v).toFixed(2)}%`}
                    />
                    <Bar dataKey="pct" name="Annual return" radius={[3, 3, 0, 0]}>
                      {years.map((y) => (
                        <Cell key={y.year} fill={y.pct >= 0 ? "hsl(152 60% 45%)" : "hsl(350 70% 55%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Trader P&amp;L</TableHead>
                    <TableHead className="text-right">Firm P&amp;L</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead className="text-right">Profitable months</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {years.map((y) => (
                    <TableRow key={y.year}>
                      <TableCell className="font-medium">{y.year}</TableCell>
                      <TableCell className="text-right">{y.trades}</TableCell>
                      <TableCell className={cn("text-right", y.traderPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {fmtMoney(y.traderPnl)}
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", y.firmPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {fmtMoney(y.firmPnl)}
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", y.pct >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {fmtPct(y.pct)}
                      </TableCell>
                      <TableCell className="text-right">{y.wins}/{y.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-xl font-bold tracking-tight", tone === "up" && "text-emerald-500", tone === "down" && "text-rose-500")}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
