import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  loading,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
}) {
  const up = change !== undefined && change > 0;
  const down = change !== undefined && change < 0;
  const flat = change !== undefined && change === 0;

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value}</div>
        )}
        {change !== undefined && !loading && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                up && "text-emerald-500",
                down && "text-rose-500",
                flat && "text-muted-foreground"
              )}
            >
              {up && <ArrowUpRight className="h-4 w-4" />}
              {down && <ArrowDownRight className="h-4 w-4" />}
              {flat && <Minus className="h-4 w-4" />}
              {Math.abs(change)}%
            </span>
            {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
