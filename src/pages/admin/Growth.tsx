import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminGrowth } from "@/hooks/useAdminAnalytics";
import { SignupChart, CumulativeChart } from "@/components/admin/AdminCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DateRange } from "@/hooks/useAdminAnalytics";

export default function Growth() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const [bucket, setBucket] = useState<"day" | "week" | "month">("day");
  const { data, isLoading } = useAdminGrowth(range, bucket);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Growth</h1>
          <p className="text-muted-foreground">Signups and total users over time.</p>
        </div>
        <ToggleGroup type="single" value={bucket} onValueChange={(v) => v && setBucket(v as typeof bucket)}>
          <ToggleGroupItem value="day">Daily</ToggleGroupItem>
          <ToggleGroupItem value="week">Weekly</ToggleGroupItem>
          <ToggleGroupItem value="month">Monthly</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">New signups</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading || !data ? <Skeleton className="h-full" /> : <SignupChart data={data} bucket={bucket} />}
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Cumulative users</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading || !data ? <Skeleton className="h-full" /> : <CumulativeChart data={data} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
