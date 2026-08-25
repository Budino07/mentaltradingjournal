import { useOutletContext } from "react-router-dom";
import {
  DateRange,
  useAdminAcquisition,
  useAdminAdCampaigns,
  useAdminLandingPages,
  useAdminTopReferrers,
  useAdminTrafficSources,
} from "@/hooks/useAdminAnalytics";
import { KPICard } from "@/components/admin/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const pct = (v: number | null | undefined) => (v == null ? "—" : `${v}%`);
const num = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString());

export default function Acquisition() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const acq = useAdminAcquisition(range);
  const sources = useAdminTrafficSources(range);
  const landing = useAdminLandingPages(range);
  const referrers = useAdminTopReferrers(range);
  const campaigns = useAdminAdCampaigns();

  const a = acq.data;
  const totalImpressions = (campaigns.data ?? []).reduce((s, c) => s + Number(c.impressions || 0), 0);
  const totalClicks = (campaigns.data ?? []).reduce((s, c) => s + Number(c.clicks || 0), 0);
  const totalSpend = (campaigns.data ?? []).reduce((s, c) => s + Number(c.spend || 0), 0);
  const ctr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Acquisition</h1>
        <p className="text-muted-foreground">Top of funnel: reach, traffic and where visitors come from.</p>
      </div>

      {acq.isLoading || !a ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Unique visitors" value={a.visitors.toLocaleString()} />
          <KPICard title="Visits (sessions)" value={a.visits.toLocaleString()} />
          <KPICard title="Pageviews" value={a.pageviews.toLocaleString()} />
          <KPICard title="Signups in range" value={a.signups.toLocaleString()} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Ad impressions" value={totalImpressions.toLocaleString()} />
        <KPICard title="Ad clicks" value={totalClicks.toLocaleString()} />
        <KPICard title="Impression → click (CTR)" value={`${ctr}%`} />
        <KPICard title="Ad spend" value={totalSpend.toLocaleString()} />
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Traffic sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sources.isLoading || !sources.data ? (
            <Skeleton className="h-64" />
          ) : sources.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits recorded in this range yet.</p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sources.data} layout="vertical" margin={{ left: 24, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="source" type="category" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                      {sources.data.map((_, i) => (
                        <Cell key={i} fill={`hsl(var(--primary) / ${1 - i * 0.1})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">Visit → signup</TableHead>
                    <TableHead className="text-right">Bounce</TableHead>
                    <TableHead className="text-right">Pages / visit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.data.map((s) => (
                    <TableRow key={s.source}>
                      <TableCell className="font-medium capitalize">{s.source}</TableCell>
                      <TableCell className="text-right">{num(s.visits)}</TableCell>
                      <TableCell className="text-right">{num(s.visitors)}</TableCell>
                      <TableCell className="text-right">{num(s.signups)}</TableCell>
                      <TableCell className="text-right">
                        {s.visits > 0 ? `${Math.round((s.signups / s.visits) * 1000) / 10}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right">{pct(s.bounce_rate)}</TableCell>
                      <TableCell className="text-right">{s.avg_pages ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Top landing pages</CardTitle>
          </CardHeader>
          <CardContent>
            {landing.isLoading || !landing.data ? (
              <Skeleton className="h-64" />
            ) : landing.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No landing data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Bounce</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landing.data.map((p) => (
                    <TableRow key={p.path}>
                      <TableCell className="font-medium">{p.path}</TableCell>
                      <TableCell className="text-right">{num(p.visits)}</TableCell>
                      <TableCell className="text-right">{pct(p.bounce_rate)}</TableCell>
                      <TableCell className="text-right">{num(p.signups)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {referrers.isLoading || !referrers.data ? (
              <Skeleton className="h-64" />
            ) : referrers.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No external referrers recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrers.data.map((r) => (
                    <TableRow key={r.referrer}>
                      <TableCell className="font-medium truncate max-w-[220px]">{r.referrer}</TableCell>
                      <TableCell className="text-right">{num(r.visits)}</TableCell>
                      <TableCell className="text-right">{num(r.visitors)}</TableCell>
                      <TableCell className="text-right">{num(r.signups)}</TableCell>
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
          <CardTitle className="text-sm font-medium text-muted-foreground">Notes on the data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Visitor and traffic-source numbers start from the moment anonymous tracking shipped, so
            earlier periods will look empty.
          </p>
          <p>
            Ad impressions, clicks and spend come from campaigns you record manually (Reddit, X,
            Google Ads). Tag your ad links with <code>?utm_source=…&amp;utm_campaign=…</code> so paid
            visits are attributed correctly here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
