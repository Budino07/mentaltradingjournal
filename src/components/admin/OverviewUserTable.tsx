import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Segment, useAdminUserList } from "@/hooks/useAdminAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "inactive" | "churned";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  inactive: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  churned: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
};

export function OverviewUserTable({ segment }: { segment: Segment }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useAdminUserList(search, segment, 30);

  const rows = useMemo(() => {
    const list = data ?? [];
    return status === "all" ? list : list.filter((u) => u.status === status);
  }, [data, status]);

  const visible = showAll ? rows : rows.slice(0, 10);

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      all: list.length,
      active: list.filter((u) => u.status === "active").length,
      inactive: list.filter((u) => u.status === "inactive").length,
      churned: list.filter((u) => u.status === "churned").length,
      subscribed: list.filter((u) => u.plan === "subscribed").length,
    };
  }, [data]);

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "inactive", label: "Inactive", count: counts.inactive },
    { key: "churned", label: "Churned", count: counts.churned },
  ];

  return (
    <Card className="bg-card/60 border-border/60">
      <CardHeader className="gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base">Users</CardTitle>
            <p className="text-sm text-muted-foreground">
              {counts.subscribed} subscribed · {counts.all - counts.subscribed} free
            </p>
          </div>
          <Input
            placeholder="Search email or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={status === f.key ? "default" : "outline"}
              onClick={() => setStatus(f.key)}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{f.count}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {isLoading || !data ? (
          <Skeleton className="h-72 m-6" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6">No users match these filters.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Signup</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="font-medium">{u.full_name || u.email}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>{format(parseISO(u.signup_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {u.last_active ? format(parseISO(u.last_active), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right">{u.session_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{u.activity_count.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          u.plan === "subscribed" && "border-primary/40 text-primary"
                        )}
                      >
                        {u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", statusStyles[u.status] || "bg-muted")}>
                        {u.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length > 10 && (
              <div className="p-4 border-t border-border/60 flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show less" : `Show all ${rows.length} users`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
