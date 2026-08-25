import { useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import { DateRange, Segment, useAdminKPIs } from "@/hooks/useAdminAnalytics";
import { KPICard } from "@/components/admin/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview() {
  const { range, segment } = useOutletContext<{ range: DateRange; segment: Segment }>();
  const { data, isLoading } = useAdminKPIs(range, segment);
  const segmentLabel =
    segment === "subscribed" ? "Subscribed users" : segment === "free" ? "Free users" : "All users";

  const pctChange = (cur: number, prev: number) => {
    if (prev === 0) return 0;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          {format(range.from, "MMM d, yyyy")} – {format(range.to, "MMM d, yyyy")} · {segmentLabel}
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title={`Total users (${segmentLabel.toLowerCase()})`} value={data.total_users.toLocaleString()} />
            <KPICard title="DAU" value={data.dau.toLocaleString()} />
            <KPICard title="WAU" value={data.wau.toLocaleString()} />
            <KPICard title="MAU" value={data.mau.toLocaleString()} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="New signups"
              value={data.signups.toLocaleString()}
              change={pctChange(data.signups, data.signups_prev)}
              changeLabel="vs previous period"
            />
            <KPICard
              title="Active users"
              value={data.active_users.toLocaleString()}
              change={pctChange(data.active_users, data.active_users_prev)}
              changeLabel="vs previous period"
            />
            <KPICard title="Subscribed users" value={data.subscribed_users.toLocaleString()} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Churn rate (vs previous period)" value={`${data.churn_rate}%`} />
            <KPICard
              title="Retention of new signups"
              value={`${data.retention_rate}%`}
            />
          </div>

          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notes on the data
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Signup and activity numbers are derived from your existing user base plus new
                analytics events. Session-level metrics (session count and average duration) only
                become accurate once users start navigating with the new tracker enabled.
              </p>
              <p>
                Retention is measured as the share of users who signed up at least 30 days ago and
                have been active at least once in the 30+ day window after signup. Churn is the
                share of previously-active users in the prior 30-day window who had no activity in
                the last 30 days.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
