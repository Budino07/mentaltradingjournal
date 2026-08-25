import { useMemo, useState } from "react";
import {
  useAdminCancellationReasons,
  useAdminCancellationComments,
  type DateRange,
} from "@/hooks/useAdminAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, MessageSquare } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const REASON_LABELS: Record<string, string> = {
  too_expensive: "Too expensive",
  missing_features: "Missing features",
  switched_service: "Switched to another service",
  unused: "Not using it",
  customer_service: "Customer service",
  too_complex: "Too complex",
  low_quality: "Quality not as expected",
  other: "Other",
  unknown: "No reason given",
};

const label = (r: string) => REASON_LABELS[r] ?? r.replace(/_/g, " ");

type SortKey = "reason" | "cancels" | "share" | "users" | "avg_months";

export function CancellationReasons({ range }: { range: DateRange }) {
  const { data, isLoading } = useAdminCancellationReasons(range);
  const comments = useAdminCancellationComments(range, 25);
  const [sortKey, setSortKey] = useState<SortKey>("cancels");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [showComments, setShowComments] = useState(false);

  const rows = useMemo(() => {
    const list = [...(data ?? [])];
    list.sort((a, b) => {
      const va = sortKey === "reason" ? label(a.reason) : a[sortKey];
      const vb = sortKey === "reason" ? label(b.reason) : b[sortKey];
      const cmp =
        typeof va === "string" && typeof vb === "string"
          ? va.localeCompare(vb)
          : Number(va) - Number(vb);
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [data, sortKey, dir]);

  const total = rows.reduce((s, r) => s + r.cancels, 0);
  const top = rows.length ? [...rows].sort((a, b) => b.cancels - a.cancels)[0] : null;

  const toggle = (key: SortKey) => {
    if (key === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir(key === "reason" ? "asc" : "desc");
    }
  };

  const Th = ({ k, children, align = "right" }: { k: SortKey; children: React.ReactNode; align?: "left" | "right" }) => (
    <th className={align === "left" ? "text-left py-2 pr-4" : "text-right py-2 pl-4"}>
      <button
        onClick={() => toggle(k)}
        className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
        {sortKey === k ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3 opacity-20" />
        )}
      </button>
    </th>
  );

  const chartData = rows.map((r) => ({ ...r, name: label(r.reason) }));

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Cancellation reasons</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {total > 0
              ? `${total} cancellation${total === 1 ? "" : "s"} in range${top ? ` · top driver: ${label(top.reason)} (${top.share}%)` : ""}`
              : "No cancellations recorded in this range."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComments((v) => !v)}
          disabled={!comments.data?.length}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Comments {comments.data?.length ? `(${comments.data.length})` : ""}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Reasons are captured from Stripe's cancellation survey going forward. Enable it in the
            Stripe Billing customer portal settings so answers start flowing in.
          </p>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 16 }}>
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number, _n, p) => [
                      `${v} cancellations (${(p.payload as { share: number }).share}%)`,
                      "Cancellations",
                    ]}
                  />
                  <Bar dataKey="cancels" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`hsl(var(--primary) / ${Math.max(0.35, 1 - i * 0.12)})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <Th k="reason" align="left">Reason</Th>
                    <Th k="cancels">Cancellations</Th>
                    <Th k="share">Share</Th>
                    <Th k="users">Users</Th>
                    <Th k="avg_months">Avg tenure</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.reason} className="border-b border-border/40 last:border-0">
                      <td className="py-2 pr-4">{label(r.reason)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{r.cancels}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{r.share}%</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{r.users}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">
                        {r.avg_months} mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showComments && comments.data?.length ? (
          <div className="space-y-2 border-t border-border/60 pt-4">
            {comments.data.map((c, i) => (
              <div key={i} className="rounded-md bg-muted/40 p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  {format(parseISO(c.canceled_at), "MMM d, yyyy")} · {label(c.reason)}
                </div>
                <p>{c.comment}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
