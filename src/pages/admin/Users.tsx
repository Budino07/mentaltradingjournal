import { useState } from "react";
import { useAdminUserList, useAdminUserTimeline } from "@/hooks/useAdminAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function Users() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<"all" | "subscribed" | "free">("all");
  const [churnDays, setChurnDays] = useState(30);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data, isLoading } = useAdminUserList(search, segment, churnDays);
  const timeline = useAdminUserTimeline(selectedUser);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
      inactive: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
      churned: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
    };
    return <Badge className={cn("capitalize", map[status] || "bg-muted")}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Search, sort, and inspect individual users.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by email or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={segment} onValueChange={(v) => setSegment(v as typeof segment)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(churnDays)} onValueChange={(v) => setChurnDays(Number(v))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="14">Inactive 14 days</SelectItem>
            <SelectItem value="30">Inactive 30 days</SelectItem>
            <SelectItem value="60">Inactive 60 days</SelectItem>
            <SelectItem value="90">Inactive 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading || !data ? (
            <Skeleton className="h-96" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Signup</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((u) => (
                  <TableRow
                    key={u.user_id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedUser(u.user_id)}
                  >
                    <TableCell>
                      <div className="font-medium">{u.full_name || u.email}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>{format(parseISO(u.signup_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {u.last_active ? format(parseISO(u.last_active), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell>{u.session_count.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{u.plan}</TableCell>
                    <TableCell>{statusBadge(u.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>User timeline</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {timeline.isLoading || !timeline.data ? (
              <Skeleton className="h-64" />
            ) : timeline.data.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity recorded.</p>
            ) : (
              <ul className="space-y-3 relative border-l pl-4">
                {timeline.data.map((row, i) => (
                  <li key={i} className="text-sm">
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(row.ts), "MMM d, yyyy h:mm a")}
                    </div>
                    <div className="font-medium capitalize">{row.label}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
