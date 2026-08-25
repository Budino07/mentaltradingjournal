import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminCohortRetention, useAdminChurnTrend, type DateRange } from "@/hooks/useAdminAnalytics";
import { ChurnTrendChart } from "@/components/admin/AdminCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { SubscriptionLifetime } from "@/components/admin/SubscriptionLifetime";
import { CancellationReasons } from "@/components/admin/CancellationReasons";


export default function Retention() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const cohort = useAdminCohortRetention();
  const churn = useAdminChurnTrend(12);
  const [weeks] = useState(12);

  const cohorts = new Map<string, { size: number; periods: Map<number, number> }>();
  cohort.data?.forEach((row) => {
    if (!cohorts.has(row.cohort)) {
      cohorts.set(row.cohort, { size: row.cohort_size, periods: new Map() });
    }
    cohorts.get(row.cohort)!.periods.set(row.period, row.retained);
  });
  const sortedCohorts = Array.from(cohorts.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Retention & Churn</h1>
        <p className="text-muted-foreground">Cohort behavior and churn trends.</p>
      </div>

      <SubscriptionLifetime />

      <CancellationReasons range={range} />


      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Churn rate trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {churn.isLoading || !churn.data ? <Skeleton className="h-full" /> : <ChurnTrendChart data={churn.data} />}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Cohort retention</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {cohort.isLoading || !cohort.data ? (
            <Skeleton className="h-64" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Cohort</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Size</th>
                  {Array.from({ length: 9 }, (_, i) => (
                    <th key={i} className="text-center py-2 px-1 font-medium text-muted-foreground min-w-[48px]">
                      W{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCohorts.map(([date, info]) => (
                  <tr key={date} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium whitespace-nowrap">
                      {format(parseISO(date), "MMM d")}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{info.size}</td>
                    {Array.from({ length: 9 }, (_, i) => {
                      const retained = info.periods.get(i) ?? 0;
                      const pct = info.size ? Math.round((retained / info.size) * 100) : 0;
                      return (
                        <td key={i} className="py-2 px-1">
                          <div
                            className={cn(
                              "h-6 w-full rounded flex items-center justify-center text-xs",
                              i === 0 && "bg-primary/10 text-foreground font-medium",
                              pct >= 50 && "bg-emerald-500/20 text-emerald-400",
                              pct > 0 && pct < 50 && "bg-primary/20 text-primary",
                              pct === 0 && i !== 0 && "bg-muted text-muted-foreground"
                            )}
                            title={`${retained} / ${info.size} (${pct}%)`}
                          >
                            {i === 0 ? "100%" : pct > 0 ? `${pct}%` : "—"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
