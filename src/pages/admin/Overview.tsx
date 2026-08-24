import { useAdminKPIs } from "@/hooks/useAdminAnalytics";
import { KPICard } from "@/components/admin/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview() {
  const { data, isLoading } = useAdminKPIs();

  const pctChange = (cur: number, prev: number) => {
    if (prev === 0) return 0;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">High-level metrics for your trading journal.</p>
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
            <KPICard title="Total users" value={data.total_users.toLocaleString()} />
            <KPICard title="DAU" value={data.dau.toLocaleString()} />
            <KPICard title="WAU" value={data.wau.toLocaleString()} />
            <KPICard title="MAU" value={data.mau.toLocaleString()} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="New signups today"
              value={data.signups_today.toLocaleString()}
              change={pctChange(data.signups_today, data.signups_yesterday)}
              changeLabel="vs yesterday"
            />
            <KPICard
              title="New signups this week"
              value={data.signups_week.toLocaleString()}
              change={pctChange(data.signups_week, data.signups_prev_week)}
              changeLabel="vs previous week"
            />
            <KPICard
              title="New signups this month"
              value={data.signups_month.toLocaleString()}
              change={pctChange(data.signups_month, data.signups_prev_month)}
              changeLabel="vs previous month"
            />
            <KPICard title="Subscribed users" value={data.subscribed_users.toLocaleString()} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="30-day churn rate" value={`${data.churn_rate}%`} />
            <KPICard
              title={`${data.retention_days}-day retention`}
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
