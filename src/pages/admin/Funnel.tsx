import { useOutletContext } from "react-router-dom";
import { DateRange, useAdminActivation, useAdminSignupFunnel } from "@/hooks/useAdminAnalytics";
import { KPICard } from "@/components/admin/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  const share = max > 0 ? Math.round((value / max) * 1000) / 10 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value.toLocaleString()} · {share}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function Funnel() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const funnel = useAdminSignupFunnel(range);
  const activation = useAdminActivation(range);

  const f = funnel.data;
  const a = activation.data;
  const rate = (part: number, whole: number) =>
    whole > 0 ? `${Math.round((part / whole) * 1000) / 10}%` : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Signup & activation</h1>
        <p className="text-muted-foreground">
          From visitor to signed-up, journaling, returning and paying.
        </p>
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Conversion funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnel.isLoading || !f ? (
            <Skeleton className="h-48" />
          ) : (
            <>
              <FunnelBar label="Visitors" value={f.visitors} max={f.visitors} />
              <FunnelBar label="Signed up" value={f.signups} max={f.visitors || f.signups} />
              <FunnelBar label="Logged first entry" value={f.journaled} max={f.visitors || f.signups} />
              <FunnelBar label="Came back for a 2nd session" value={f.second_session} max={f.visitors || f.signups} />
              <FunnelBar label="Upgraded to paid" value={f.paid} max={f.visitors || f.signups} />
              <p className="text-sm text-muted-foreground pt-2">
                Visitor → signup: <strong>{rate(f.signups, f.visitors)}</strong> · Signup → first
                entry: <strong>{rate(f.journaled, f.signups)}</strong> · Signup → paid:{" "}
                <strong>{rate(f.paid, f.signups)}</strong>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Signup method</CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.isLoading || !f ? (
              <Skeleton className="h-40" />
            ) : f.methods.length === 0 ? (
              <p className="text-sm text-muted-foreground">No signups in this range.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {f.methods.map((m) => (
                    <TableRow key={m.method}>
                      <TableCell className="font-medium capitalize">{m.method}</TableCell>
                      <TableCell className="text-right">{m.users.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{rate(m.users, f.signups)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Time from first visit to signup</CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.isLoading || !f ? (
              <Skeleton className="h-40" />
            ) : f.time_to_signup.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No matched visits yet — this needs anonymous tracking data before signup.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delay</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {f.time_to_signup.map((t) => (
                    <TableRow key={t.bucket}>
                      <TableCell className="font-medium">{t.bucket}</TableCell>
                      <TableCell className="text-right">{t.users.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Activation of new signups</h2>
        {activation.isLoading || !a ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard title="New signups in range" value={a.cohort.toLocaleString()} />
              <KPICard title="Logged a trade in 24h" value={rate(a.entry_24h, a.cohort)} />
              <KPICard title="Logged a trade in 7 days" value={rate(a.entry_7d, a.cohort)} />
              <KPICard title="Returned within 7 days" value={rate(a.second_session_7d, a.cohort)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
              <KPICard title="Ever logged a trade" value={rate(a.entry_ever, a.cohort)} />
              <KPICard title="Ran a backtest in 7 days" value={rate(a.backtest_7d, a.cohort)} />
              <KPICard
                title="Signed up, never journaled"
                value={a.signed_up_never_journaled.toLocaleString()}
              />
              <KPICard
                title="Median time to first entry"
                value={a.median_hours_to_first_entry ? `${a.median_hours_to_first_entry}h` : "—"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
