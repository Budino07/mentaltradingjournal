import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTraderStats, type TraderSummary } from "@/hooks/useTraderAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, Info, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtMoney, fmtNum, fmtPct } from "@/lib/traderMetrics";
import { PropFirmReturns } from "@/components/admin/PropFirmReturns";

type SortKey =
  | "name" | "trades" | "netPnl" | "winRate" | "profitFactor" | "avgWin" | "avgLoss"
  | "winLossRatio" | "maxDrawdown" | "maxDrawdownDays" | "tradesPerWeek"
  | "longestWinStreak" | "longestLossStreak" | "monthsTraded" | "consistency";

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Trader" },
  { key: "trades", label: "Trades", align: "right" },
  { key: "netPnl", label: "Net P&L", align: "right" },
  { key: "winRate", label: "Win rate", align: "right" },
  { key: "profitFactor", label: "Profit factor", align: "right" },
  { key: "avgWin", label: "Avg win", align: "right" },
  { key: "avgLoss", label: "Avg loss", align: "right" },
  { key: "winLossRatio", label: "W/L ratio", align: "right" },
  { key: "maxDrawdown", label: "Max DD", align: "right" },
  { key: "maxDrawdownDays", label: "DD days", align: "right" },
  { key: "tradesPerWeek", label: "Trades/wk", align: "right" },
  { key: "longestWinStreak", label: "Win streak", align: "right" },
  { key: "longestLossStreak", label: "Loss streak", align: "right" },
  { key: "monthsTraded", label: "Months", align: "right" },
  { key: "consistency", label: "Profitable months", align: "right" },
];

function valueOf(row: TraderSummary, key: SortKey): number | string {
  if (key === "name") return (row.full_name || row.email || "").toLowerCase();
  const v = row.metrics[key as keyof typeof row.metrics];
  return typeof v === "number" ? v : -Infinity;
}

export default function Traders() {
  const { data, isLoading, error } = useTraderStats();
  const [search, setSearch] = useState("");
  const [minTrades, setMinTrades] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("netPnl");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    // An explicit trader selection wins over the min-trade threshold.
    let list = selectedIds.length
      ? (data ?? []).filter((r) => selectedIds.includes(r.user_id))
      : (data ?? []).filter((r) => r.metrics.trades >= minTrades);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => (r.email ?? "").toLowerCase().includes(q) || (r.full_name ?? "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const av = valueOf(a, sortKey);
      const bv = valueOf(b, sortKey);
      if (typeof av === "string" || typeof bv === "string") {
        return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      }
      return asc ? av - bv : bv - av;
    });
  }, [data, search, minTrades, selectedIds, sortKey, asc]);


  const toggle = (key: SortKey) => {
    if (key === sortKey) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(key === "name" || key === "maxDrawdown" || key === "avgLoss" || key === "longestLossStreak");
    }
  };

  const leaders = useMemo(
    () =>
      [...(data ?? [])]
        .filter((r) => r.metrics.trades >= Math.max(minTrades, 10) && r.metrics.netPnl > 0)
        .sort((a, b) => (b.metrics.profitFactor ?? 0) - (a.metrics.profitFactor ?? 0))
        .slice(0, 3),
    [data, minTrades]
  );

  const exportCsv = () => {
    const head = ["trader", ...columns.slice(1).map((c) => c.label)].join(",");
    const body = rows
      .map((r) =>
        [
          `"${(r.full_name || r.email || r.user_id).replace(/"/g, "'")}"`,
          ...columns.slice(1).map((c) => {
            const v = r.metrics[c.key as keyof typeof r.metrics];
            return typeof v === "number" ? v.toFixed(2) : "";
          }),
        ].join(",")
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([`${head}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "trader-performance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trader Performance</h1>
        <p className="text-muted-foreground">
          Internal evaluation of journalled trading performance for capital allocation.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Read these numbers with care</AlertTitle>
        <AlertDescription className="text-sm">
          All P&amp;L is <strong>self-reported</strong> by users in their journal — no broker feed verifies it —
          and is <strong>gross of fees and commissions</strong>, which the app never captured.
          Percentage return on capital and risk-per-trade as a % of balance are{" "}
          <strong>unavailable</strong>: no account-balance data exists anywhere in the database.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load traders</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/60 border-border/60">
        <CardContent className="flex flex-col gap-2 py-4">
          <div className="text-sm font-medium">Filter traders</div>
          <TraderSelect
            options={(data ?? []).map((r) => ({ user_id: r.user_id, email: r.email, full_name: r.full_name }))}
            selected={selectedIds}
            onChange={setSelectedIds}
          />
          <p className="text-xs text-muted-foreground">
            Pick specific traders by email — the prop firm book, leaderboard and CSV export all follow this
            selection. Leave empty to include everyone above the min-trade threshold.
          </p>
        </CardContent>
      </Card>

      <PropFirmReturns traders={rows} />


      {leaders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {leaders.map((r, i) => (
            <Card key={r.user_id} className="bg-card/60 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className={cn("h-4 w-4", i === 0 ? "text-amber-500" : "text-muted-foreground")} />
                  #{i + 1} by profit factor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Link to={`/admin/traders/${r.user_id}`} className="font-semibold hover:underline block truncate">
                  {r.full_name || r.email}
                </Link>
                <div className="text-2xl font-bold tracking-tight text-emerald-500">
                  {fmtMoney(r.metrics.netPnl)}
                </div>
                <div className="text-xs text-muted-foreground">
                  PF {fmtNum(r.metrics.profitFactor)} · {fmtPct(r.metrics.winRate)} win ·{" "}
                  {r.metrics.trades} trades
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-card/60 border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle>Leaderboard</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Search trader…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48"
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Min trades
              <Input
                type="number"
                min={0}
                value={minTrades}
                onChange={(e) => setMinTrades(Math.max(0, Number(e.target.value) || 0))}
                className="w-20"
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No traders match these filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead
                        key={c.key}
                        className={cn("cursor-pointer select-none whitespace-nowrap", c.align === "right" && "text-right")}
                        onClick={() => toggle(c.key)}
                      >
                        <span className={cn("inline-flex items-center gap-1", c.align === "right" && "flex-row-reverse")}>
                          {c.label}
                          {sortKey === c.key ? (
                            asc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const m = r.metrics;
                    return (
                      <TableRow key={r.user_id} className="hover:bg-accent/40">
                        <TableCell className="whitespace-nowrap">
                          <Link to={`/admin/traders/${r.user_id}`} className="font-medium hover:underline">
                            {r.full_name || r.email}
                          </Link>
                          {r.missing_pnl > 0 && (
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {r.missing_pnl} no P&amp;L
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{m.trades}</TableCell>
                        <TableCell className={cn("text-right font-medium", m.netPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                          {fmtMoney(m.netPnl)}
                        </TableCell>
                        <TableCell className="text-right">{fmtPct(m.winRate)}</TableCell>
                        <TableCell className="text-right">{fmtNum(m.profitFactor)}</TableCell>
                        <TableCell className="text-right">{fmtMoney(m.avgWin)}</TableCell>
                        <TableCell className="text-right">{fmtMoney(m.avgLoss)}</TableCell>
                        <TableCell className="text-right">{fmtNum(m.winLossRatio)}</TableCell>
                        <TableCell className="text-right text-rose-500">{fmtMoney(m.maxDrawdown)}</TableCell>
                        <TableCell className="text-right">{m.maxDrawdownDays ?? "—"}</TableCell>
                        <TableCell className="text-right">{fmtNum(m.tradesPerWeek, 1)}</TableCell>
                        <TableCell className="text-right">{m.longestWinStreak}</TableCell>
                        <TableCell className="text-right">{m.longestLossStreak}</TableCell>
                        <TableCell className="text-right">{m.monthsTraded}</TableCell>
                        <TableCell className="text-right">
                          {m.profitableMonths}/{m.monthsTraded} ({fmtPct(m.consistency, 0)})
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
