import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAdminSubscriptionStats } from "@/hooks/useAdminAnalytics";

const bucketOrder = ["<1", "1", "2", "3", "4-6", "7-12", "12+"];
const bucketLabel: Record<string, string> = {
  "<1": "< 1 month",
  "1": "1 month",
  "2": "2 months",
  "3": "3 months",
  "4-6": "4–6 months",
  "7-12": "7–12 months",
  "12+": "12+ months",
};

export function SubscriptionLifetime() {
  const { data, isLoading } = useAdminSubscriptionStats();

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  const monthly = data.by_plan.find((p) => p.plan === "monthly");
  const yearly = data.by_plan.find((p) => p.plan === "yearly");

  const distMap = new Map(
    data.distribution.filter((d) => d.plan === "monthly").map((d) => [d.bucket, d.subs])
  );
  const distData = bucketOrder.map((b) => ({
    bucket: bucketLabel[b],
    subs: distMap.get(b) ?? 0,
  }));

  const survival = data.survival.map((s) => ({ ...s, label: `M${s.month}` }));

  const stat = (label: string, value: string, hint?: string) => (
    <div className="rounded-lg border border-border/60 bg-card/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">Subscription lifetime</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            How long subscribers stay before cancelling. Based on all {data.totals.subscriptions}{" "}
            subscriptions from {data.totals.subscribers} users.
          </p>
        </div>
        <Badge variant="secondary">All-time</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stat(
            "Avg months before cancel (monthly)",
            monthly?.avg_months_churned != null ? `${monthly.avg_months_churned}` : "—",
            `${monthly?.churned ?? 0} cancelled subscriptions`
          )}
          {stat(
            "Median months (monthly)",
            monthly?.median_months_churned != null ? `${monthly.median_months_churned}` : "—",
            "Typical subscriber"
          )}
          {stat(
            "Longest run (monthly)",
            monthly?.max_months_churned != null ? `${monthly.max_months_churned} mo` : "—",
            "Best cancelled subscriber"
          )}
          {stat(
            "Active monthly subs",
            `${monthly?.active ?? 0}`,
            monthly?.avg_months_active != null
              ? `Avg ${monthly.avg_months_active} mo so far`
              : undefined
          )}
          {stat("Yearly subs", `${yearly?.total ?? 0}`, `${yearly?.active ?? 0} still active`)}
          {stat(
            "Repeat subscribers",
            `${data.totals.repeat_subscribers}`,
            "Users who subscribed more than once"
          )}
          {stat(
            "Monthly churn count",
            `${monthly?.churned ?? 0} / ${monthly?.total ?? 0}`,
            "Cancelled vs total monthly"
          )}
          {stat(
            "Avg lifetime, all monthly",
            monthly?.avg_months_all != null ? `${monthly.avg_months_all} mo` : "—",
            "Includes still-active subs"
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium mb-2">Cancellations by tenure (monthly plan)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(v: number) => [`${v} subscriptions`, "Cancelled"]}
                  />
                  <Bar dataKey="subs" radius={[4, 4, 0, 0]}>
                    {distData.map((_, i) => (
                      <Cell key={i} fill="hsl(var(--primary))" fillOpacity={1 - i * 0.1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Survival curve (monthly plan)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={survival} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(v: number, _n, p) => [
                      `${v}% (${p.payload.surviving} of ${p.payload.cohort})`,
                      "Still subscribed",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="pct"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Lifetime is measured from the subscription start to the end of the paid period it was
          cancelled in. Plans are classified as yearly when the billing period is longer than 200
          days. Active subscriptions are excluded from the cancellation averages.
        </p>
      </CardContent>
    </Card>
  );
}
