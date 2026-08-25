import { useOutletContext } from "react-router-dom";
import { DateRange, useAdminMonetization, useAdminPlanPrices } from "@/hooks/useAdminAnalytics";
import { KPICard } from "@/components/admin/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Monetization() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const { data, isLoading } = useAdminMonetization(range);
  const prices = useAdminPlanPrices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monetization</h1>
        <p className="text-muted-foreground">Free → paid conversion, time to upgrade and recurring revenue.</p>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Paying users" value={data.paying_users.toLocaleString()} />
            <KPICard title="Free → paid conversion" value={`${data.free_to_paid_rate}%`} />
            <KPICard
              title="Avg time to upgrade"
              value={data.avg_days_to_upgrade ? `${data.avg_days_to_upgrade} days` : "—"}
            />
            <KPICard
              title="Median time to upgrade"
              value={data.median_days_to_upgrade ? `${data.median_days_to_upgrade} days` : "—"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title={`MRR (${data.currency?.toUpperCase() || ""})`}
              value={data.prices_configured > 0 ? Math.round(data.mrr).toLocaleString() : "Set prices"}
            />
            <KPICard title="Total users" value={data.total_users.toLocaleString()} />
          </div>

          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">MRR trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {data.mrr_trend?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.mrr_trend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Line type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No revenue trend yet — add your Stripe price amounts below.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Where upgrades are triggered</CardTitle>
            </CardHeader>
            <CardContent>
              {data.upgrade_sources?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.upgrade_sources.map((s) => (
                      <TableRow key={s.source}>
                        <TableCell className="font-medium capitalize">{s.source.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-right">{s.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{s.users.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upgrade clicks recorded yet — these appear once users hit the pricing page or an
                  in-app upgrade prompt with tracking enabled.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Configured plan prices</CardTitle>
        </CardHeader>
        <CardContent>
          {prices.isLoading ? (
            <Skeleton className="h-24" />
          ) : (prices.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No prices configured. MRR stays at zero until each Stripe price id has an amount stored
              in the plan prices table.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price ID</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.data!.map((p) => (
                  <TableRow key={p.price_id}>
                    <TableCell className="font-mono text-xs">{p.price_id}</TableCell>
                    <TableCell>{p.nickname ?? "—"}</TableCell>
                    <TableCell className="capitalize">{p.interval}</TableCell>
                    <TableCell className="text-right">
                      {Number(p.unit_amount).toLocaleString()} {p.currency?.toUpperCase()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
