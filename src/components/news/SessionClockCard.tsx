import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { WorldMap } from "./WorldMap";
import {
  MARKET_SESSIONS,
  hoursUntilOpen,
  isSessionActive,
  localTime,
} from "./sessionData";

export const SessionClockCard = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utcClock = now.toISOString().slice(11, 19);
  const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userLocal = localTime(userZone, now);
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

  const { activeSession, nextSession, countdown } = useMemo(() => {
    const active = MARKET_SESSIONS.find((s) => isSessionActive(s, utcHours));
    const upcoming = [...MARKET_SESSIONS]
      .filter((s) => s.name !== active?.name)
      .sort((a, b) => hoursUntilOpen(a, utcHours) - hoursUntilOpen(b, utcHours))[0];
    const untilHours = upcoming ? hoursUntilOpen(upcoming, utcHours) : 0;
    const h = Math.floor(untilHours);
    const m = Math.floor((untilHours - h) * 60);
    return { activeSession: active, nextSession: upcoming, countdown: `${h}h ${m}m` };
  }, [utcHours]);

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
        <div className="p-5">
          <p className="text-sm text-muted-foreground">Session Clock</p>
          <h2 className="font-mono text-3xl md:text-4xl font-bold tracking-tight tabular-nums">
            {utcClock} UTC
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Local {userLocal} · {userZone}
          </p>

          <div className="mt-4 rounded-lg border border-border bg-muted/30 h-[220px] text-foreground">
            <WorldMap activeSession={activeSession} nextSession={nextSession} />
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-border flex flex-col">
          <p className="px-4 py-3 text-xs font-semibold tracking-widest text-muted-foreground">
            MARKETS
          </p>
          <div className="flex-1">
            {MARKET_SESSIONS.map((s) => {
              const active = activeSession?.name === s.name;
              return (
                <div
                  key={s.name}
                  className={`flex items-center justify-between gap-2 px-4 py-3 border-t border-border ${
                    active ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        active ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {localTime(s.timeZone, now)}
                      </p>
                    </div>
                  </div>
                  {active && (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
            Next: <span className="font-medium text-foreground">{nextSession?.name}</span> in {countdown}
          </div>
        </div>
      </div>
    </Card>
  );
};
