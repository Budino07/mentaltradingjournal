import { useOutletContext } from "react-router-dom";
import { useAdminActiveUsers, useAdminSessions, useAdminFeatureUsage, DateRange } from "@/hooks/useAdminAnalytics";
import { ActiveUsersChart, SessionsChart, FeatureBarChart } from "@/components/admin/AdminCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Engagement() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const active = useAdminActiveUsers(range);
  const sessions = useAdminSessions(range);
  const features = useAdminFeatureUsage(range);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Engagement</h1>
        <p className="text-muted-foreground">How users interact with the product.</p>
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Active users</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {active.isLoading || !active.data ? <Skeleton className="h-full" /> : <ActiveUsersChart data={active.data} />}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Sessions & average duration</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {sessions.isLoading || !sessions.data ? <Skeleton className="h-full" /> : <SessionsChart data={sessions.data} />}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Most used features / pages</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          {features.isLoading || !features.data ? <Skeleton className="h-full" /> : <FeatureBarChart data={features.data} />}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Least used features</CardTitle>
        </CardHeader>
        <CardContent>
          {features.isLoading || !features.data ? (
            <Skeleton className="h-32" />
          ) : (
            <ul className="divide-y">
              {[...features.data].reverse().slice(0, 8).map((f) => (
                <li key={f.feature} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{f.feature}</span>
                  <span className="text-muted-foreground">{f.uses} uses · {f.users} users</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
