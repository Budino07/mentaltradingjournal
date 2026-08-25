import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { DateRange, useAdminActivityBreakdown } from "@/hooks/useAdminAnalytics";

type Metric = "uses" | "users" | "total_seconds";
type SortKey = "feature" | "uses" | "share" | "users" | "avg_seconds" | "total_seconds";
type SortDir = "desc" | "asc";

const metrics: { key: Metric; label: string }[] = [
  { key: "uses", label: "Interactions" },
  { key: "users", label: "Unique users" },
  { key: "total_seconds", label: "Time spent" },
];

const columns: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "feature", label: "Feature", align: "left" },
  { key: "uses", label: "Interactions", align: "right" },
  { key: "share", label: "Share", align: "right" },
  { key: "users", label: "Users", align: "right" },
  { key: "avg_seconds", label: "Avg time", align: "right" },
  { key: "total_seconds", label: "Total time", align: "right" },
];

function fmtDuration(sec: number) {
  if (!sec) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ${Math.round(sec % 60)}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function ActivitiesBreakdown({ range }: { range: DateRange }) {
  const { data, isLoading } = useAdminActivityBreakdown(range);
  const [metric, setMetric] = useState<Metric>("uses");
  const [sortKey, setSortKey] = useState<SortKey>("uses");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedData = useMemo(() => {
    if (!data) return [];
    const dir = sortDir === "desc" ? -1 : 1;
    return [...data].sort((a, b) => {
      if (sortKey === "feature") {
        return dir * a.feature.localeCompare(b.feature);
      }
      return dir * (Number(a[sortKey]) - Number(b[sortKey]));
    });
  }, [data, sortKey, sortDir]);

  const chartData = useMemo(() => {
    return sortedData.slice(0, 10).map((d) => ({ ...d, value: Number(d[metric]) }));
  }, [sortedData, metric]);

  const totals = useMemo(() => {
    if (!data) return { uses: 0, users: 0, seconds: 0 };
    return {
      uses: data.reduce((s, d) => s + Number(d.uses), 0),
      users: Math.max(0, ...data.map((d) => Number(d.users))),
      seconds: data.reduce((s, d) => s + Number(d.total_seconds), 0),
    };
  }, [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Activities breakdown</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Top used features, how many people touch them and how long they stay.
          </p>
        </div>
        <div className="flex gap-1">
          {metrics.map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={metric === m.key ? "default" : "outline"}
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading || !data ? (
          <Skeleton className="h-80 w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No activity recorded in this period.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Total interactions</p>
                <p className="text-xl font-semibold">{totals.uses.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Features used</p>
                <p className="text-xl font-semibold">{data.length}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Total time on app</p>
                <p className="text-xl font-semibold">{fmtDuration(totals.seconds)}</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 24 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (metric === "total_seconds" ? fmtDuration(Number(v)) : String(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    width={140}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8,
                    }}
                    formatter={(v: number) => [
                      metric === "total_seconds" ? fmtDuration(Number(v)) : Number(v).toLocaleString(),
                      metrics.find((m) => m.key === metric)?.label ?? "",
                    ]}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, i) => {
                      const rank = sortDir === "desc" ? i : chartData.length - 1 - i;
                      return <Cell key={i} fill="hsl(var(--primary))" fillOpacity={1 - rank * 0.07} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/60">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`py-2 font-medium ${col.align === "right" ? "text-right" : ""}`}
                      >
                        <button
                          onClick={() => handleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {col.label}
                          {sortKey === col.key &&
                            (sortDir === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ))}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((d) => (
                    <tr key={d.feature} className="border-b border-border/40 last:border-0">
                      <td className="py-2">
                        <span className="font-medium">{d.feature}</span>{" "}
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          {d.kind === "page" ? "page" : d.kind}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">{Number(d.uses).toLocaleString()}</td>
                      <td className="py-2 text-right text-muted-foreground">{Number(d.share ?? 0)}%</td>
                      <td className="py-2 text-right">{Number(d.users).toLocaleString()}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {fmtDuration(Number(d.avg_seconds))}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {fmtDuration(Number(d.total_seconds))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Time spent is estimated from the gap between consecutive tracked events in a session
              (capped at 30 minutes). Content actions such as journal entries, backtests, notes and
              weekly reviews are counted as interactions but carry no dwell time.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
