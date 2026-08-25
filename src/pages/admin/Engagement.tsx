import { useOutletContext } from "react-router-dom";
import {
  useAdminActiveUsers,
  useAdminSessions,
  useAdminFeatureUsage,
  useAdminEngagementQuality,
  useAdminPageBounce,
  useAdminDeviceBreakdown,
  DateRange,
} from "@/hooks/useAdminAnalytics";
import { KPICard } from "@/components/admin/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActiveUsersChart, SessionsChart, FeatureBarChart } from "@/components/admin/AdminCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Engagement() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const active = useAdminActiveUsers(range);
  const sessions = useAdminSessions(range);
  const features = useAdminFeatureUsage(range);
  const quality = useAdminEngagementQuality(range);
  const bounce = useAdminPageBounce(range);
  const devices = useAdminDeviceBreakdown(range);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Engagement</h1>
        <p className="text-muted-foreground">How users interact with the product.</p>
      </div>

      {quality.isLoading || !quality.data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Sessions" value={quality.data.sessions.toLocaleString()} />
          <KPICard
            title="Avg session duration"
            value={`${Math.floor((quality.data.avg_duration_sec ?? 0) / 60)}m ${Math.round(
              (quality.data.avg_duration_sec ?? 0) % 60
            )}s`}
          />
          <KPICard title="Pages per session" value={quality.data.pages_per_session ?? 0} />
          <KPICard title="Bounce rate" value={`${quality.data.bounce_rate ?? 0}%`} />
        </div>
      )}

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Highest bounce pages</CardTitle>
          </CardHeader>
          <CardContent>
            {bounce.isLoading || !bounce.data ? (
              <Skeleton className="h-64" />
            ) : bounce.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page entry data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Entries</TableHead>
                    <TableHead className="text-right">Bounce</TableHead>
                    <TableHead className="text-right">Avg time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bounce.data.map((p) => (
                    <TableRow key={p.path}>
                      <TableCell className="font-medium">{p.path}</TableCell>
                      <TableCell className="text-right">{p.entries}</TableCell>
                      <TableCell className="text-right">{p.bounce_rate ?? "—"}%</TableCell>
                      <TableCell className="text-right">{Math.round((p.avg_seconds ?? 0) / 60)}m</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Device breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {devices.isLoading || !devices.data ? (
              <Skeleton className="h-64" />
            ) : devices.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No device data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead className="text-right">Pages</TableHead>
                    <TableHead className="text-right">Bounce</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.data.map((d) => (
                    <TableRow key={d.device}>
                      <TableCell className="font-medium capitalize">{d.device}</TableCell>
                      <TableCell className="text-right">{d.sessions}</TableCell>
                      <TableCell className="text-right">{d.pages_per_session ?? "—"}</TableCell>
                      <TableCell className="text-right">{d.bounce_rate ?? "—"}%</TableCell>
                      <TableCell className="text-right">{d.signups}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

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
