import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

const axisClass = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
const gridColor = "hsl(var(--border))";

function dateTick(v: string) {
  try {
    return format(parseISO(v), "MMM d");
  } catch {
    return v;
  }
}

export function SignupChart({
  data,
  bucket,
}: {
  data: { bucket: string; signups: number; cumulative: number }[];
  bucket: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="bucket" tickFormatter={dateTick} tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis tick={axisClass} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
          }}
          labelFormatter={(v) => dateTick(v as string)}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="signups"
          name={`New signups (${bucket})`}
          stroke="hsl(var(--primary))"
          fill="url(#signups)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CumulativeChart({
  data,
}: {
  data: { bucket: string; signups: number; cumulative: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="bucket" tickFormatter={dateTick} tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis tick={axisClass} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
          }}
          labelFormatter={(v) => dateTick(v as string)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="Total users"
          stroke="hsl(var(--chart-2, var(--primary)))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ActiveUsersChart({
  data,
}: {
  data: { day: string; dau: number; wau: number; mau: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tickFormatter={dateTick} tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis tick={axisClass} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
          }}
          labelFormatter={(v) => dateTick(v as string)}
        />
        <Legend />
        <Line type="monotone" dataKey="dau" name="DAU" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="wau" name="WAU" stroke="hsl(var(--chart-2, var(--primary)))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="mau" name="MAU" stroke="hsl(var(--chart-3, var(--primary)))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SessionsChart({
  data,
}: {
  data: { day: string; sessions: number; avg_duration_sec: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tickFormatter={dateTick} tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={axisClass} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
          }}
          labelFormatter={(v) => dateTick(v as string)}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="sessions" name="Sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avg_duration_sec"
          name="Avg duration (sec)"
          stroke="hsl(var(--chart-2, var(--primary)))"
          strokeWidth={2}
          dot={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FeatureBarChart({
  data,
}: {
  data: { feature: string; users: number; uses: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data.slice(0, 10)}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
      >
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis dataKey="feature" type="category" width={120} tick={axisClass} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
          }}
        />
        <Legend />
        <Bar dataKey="users" name="Unique users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        <Bar dataKey="uses" name="Total uses" fill="hsl(var(--chart-2, var(--primary)))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ChurnTrendChart({
  data,
}: {
  data: { week: string; churn_rate: number; churned: number; base: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="churn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="week" tickFormatter={dateTick} tick={axisClass} axisLine={false} tickLine={false} />
        <YAxis tick={axisClass} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
          }}
          labelFormatter={(v) => dateTick(v as string)}
        />
        <Area
          type="monotone"
          dataKey="churn_rate"
          name="Churn rate"
          stroke="hsl(var(--destructive))"
          fill="url(#churn)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
