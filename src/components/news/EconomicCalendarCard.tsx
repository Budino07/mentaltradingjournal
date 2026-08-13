import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CalendarDays, Clock, Filter, Globe, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

type Impact = "high" | "medium" | "low";

interface EconEvent {
  id: string;
  timestamp: string;
  flag: string;
  country: string;
  currency: string;
  impact: Impact;
  name: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
}

type Week = "lastweek" | "thisweek" | "nextweek";

const fetchEvents = async (week: Week): Promise<EconEvent[]> => {
  const { data, error } = await supabase.functions.invoke(`economic-calendar?week=${week}`, {
    method: "GET",
  });
  if (error) throw error;
  return (data?.events ?? []) as EconEvent[];
};

const IMPACT_COLOR: Record<Impact, string> = {
  high: "bg-destructive",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
};

const IMPACT_TEXT: Record<Impact, string> = {
  high: "text-destructive",
  medium: "text-yellow-500",
  low: "text-emerald-500",
};

const ImpactBars = ({ impact }: { impact: Impact }) => {
  const filled = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
  return (
    <span className="flex items-end gap-[2px]" aria-label={`${impact} impact`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm ${i < filled ? IMPACT_COLOR[impact] : "bg-muted"}`}
          style={{ height: `${6 + i * 3}px` }}
        />
      ))}
    </span>
  );
};

const valueClass = (value: string | null, previous: string | null) => {
  if (value === null || previous === null) return "text-muted-foreground";
  const a = parseFloat(value);
  const p = parseFloat(previous);
  if (isNaN(a) || isNaN(p)) return "text-foreground";
  if (a > p) return "text-emerald-500";
  if (a < p) return "text-destructive";
  return "text-foreground";
};

export const EconomicCalendarCard = () => {
  const [impact, setImpact] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [country, setCountry] = useState("all");
  const [week, setWeek] = useState<Week>("thisweek");
  const [range, setRange] = useState<"today" | "week">("today");
  const [tz, setTz] = useState<"utc" | "local">("utc");

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["economic-calendar", week],
    queryFn: () => fetchEvents(week),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const allEvents = useMemo(() => data ?? [], [data]);

  const scoped = useMemo(() => {
    if (range === "today" && week === "thisweek") {
      const now = new Date();
      return allEvents.filter((e) => isSameDay(new Date(e.timestamp), now));
    }
    return allEvents;
  }, [allEvents, range, week]);

  const events = useMemo(
    () =>
      scoped.filter(
        (e) =>
          (impact === "all" || e.impact === impact) &&
          (currency === "all" || e.currency === currency) &&
          (country === "all" || e.country === country)
      ),
    [scoped, impact, currency, country]
  );

  const countries = useMemo(
    () => Array.from(new Set(scoped.map((e) => e.country))).sort(),
    [scoped]
  );
  const currencies = useMemo(
    () => Array.from(new Set(scoped.map((e) => e.currency))).sort(),
    [scoped]
  );
  const highImpact = events.filter((e) => e.impact === "high").length;
  const upcoming = events.filter((e) => new Date(e.timestamp).getTime() > Date.now()).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return tz === "utc"
      ? `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
      : format(d, "HH:mm");
  };

  const groups = useMemo(() => {
    const map = new Map<string, EconEvent[]>();
    for (const e of events) {
      const key = format(new Date(e.timestamp), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([x], [y]) => x.localeCompare(y));
  }, [events]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-5 pb-3 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Economic Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Market-moving events and releases · live from ForexFactory
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh calendar"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={week} onValueChange={(v) => setWeek(v as Week)}>
            <SelectTrigger className="w-[130px] h-9 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lastweek">Last week</SelectItem>
              <SelectItem value="thisweek">This week</SelectItem>
              <SelectItem value="nextweek">Next week</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={(v) => setRange(v as "today" | "week")}>
            <SelectTrigger className="w-[120px] h-9 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Full week</SelectItem>
            </SelectContent>
          </Select>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[140px] h-9 rounded-full"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Country</SelectItem>
              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[130px] h-9 rounded-full"><SelectValue placeholder="Currency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Currency</SelectItem>
              {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={impact} onValueChange={setImpact}>
            <SelectTrigger className="w-[120px] h-9 rounded-full"><SelectValue placeholder="Impact" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Impact</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tz} onValueChange={(v) => setTz(v as "utc" | "local")}>
            <SelectTrigger className="w-[150px] h-9 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">GMT+0 (UTC)</SelectItem>
              <SelectItem value="local">Local time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-border pt-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{events.length}</span> Total Events
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-foreground">{highImpact}</span> High Impact
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{new Set(events.map((e) => e.country)).size}</span> Countries
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-foreground">{upcoming}</span> Upcoming
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[720px]">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading economic events…
          </div>
        )}

        {isError && (
          <div className="px-5 py-12 text-center space-y-3">
            <p className="text-sm text-destructive">
              Couldn't load the calendar{error instanceof Error ? `: ${error.message}` : ""}.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
          </div>
        )}

        {!isLoading && !isError && groups.map(([day, dayEvents]) => (
          <div key={day}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-card/95 backdrop-blur border-y border-border px-5 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold tracking-wide">
                  {isSameDay(new Date(day), new Date()) ? "TODAY" : format(new Date(day), "EEEE").toUpperCase()}
                </span>
                <span className="text-muted-foreground">{format(new Date(day), "EEE, MMM d")}</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
                {dayEvents.length} events
              </span>
            </div>

            {dayEvents.map((e) => (
              <div key={e.id} className="px-5 py-3 border-b border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm text-muted-foreground w-12 shrink-0 pt-0.5">{formatTime(e.timestamp)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{e.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-6 gap-y-1">
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none">{e.flag}</span>
                        <ImpactBars impact={e.impact} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${IMPACT_TEXT[e.impact]}`}>
                          {e.impact}
                        </span>
                      </span>
                      {e.actual && (
                        <span className="text-xs font-mono">
                          A: <span className={valueClass(e.actual, e.previous)}>{e.actual}</span>
                        </span>
                      )}
                      <span className="text-xs font-mono text-muted-foreground">F: {e.forecast ?? "--"}</span>
                      <span className="text-xs font-mono text-muted-foreground">P: {e.previous ?? "--"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {!isLoading && !isError && events.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No events match the selected filters.
          </p>
        )}
      </div>
    </Card>
  );
};
