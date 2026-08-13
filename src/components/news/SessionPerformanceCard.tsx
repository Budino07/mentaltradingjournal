import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = { session: string; pnl: number; winRate: number; trades: number; expectancy: number };

const DATA: Record<"entry" | "exit", Row[]> = {
  entry: [
    { session: "New York", pnl: 1083.73, winRate: 58.8, trades: 17, expectancy: 63.75 },
    { session: "Sydney", pnl: 250.05, winRate: 50, trades: 4, expectancy: 62.51 },
    { session: "Tokyo", pnl: 2.2, winRate: 33.3, trades: 3, expectancy: 0.73 },
    { session: "London", pnl: -276.6, winRate: 41.7, trades: 12, expectancy: -23.05 },
  ],
  exit: [
    { session: "New York", pnl: 942.11, winRate: 55.6, trades: 18, expectancy: 52.34 },
    { session: "Sydney", pnl: 180.4, winRate: 50, trades: 4, expectancy: 45.1 },
    { session: "Tokyo", pnl: -14.8, winRate: 33.3, trades: 3, expectancy: -4.93 },
    { session: "London", pnl: -48.2, winRate: 45.5, trades: 11, expectancy: -4.38 },
  ],
};

const money = (v: number) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const shortMoney = (v: number) =>
  Math.abs(v) >= 1000 ? `${v < 0 ? "-" : ""}$${(Math.abs(v) / 1000).toFixed(1)}K` : money(v);

const LockedCell = () => (
  <span className="inline-flex items-center justify-center rounded bg-muted px-3 py-1 text-muted-foreground">
    <Lock className="h-3.5 w-3.5" />
  </span>
);

export const SessionPerformanceCard = () => {
  const [mode, setMode] = useState<"entry" | "exit">("entry");
  const rows = DATA[mode];
  const best = [...rows].sort((a, b) => b.pnl - a.pnl)[0];
  const max = Math.max(...rows.map((r) => Math.abs(r.pnl)));

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Session Performance</p>
          <h3 className="text-xl md:text-2xl font-bold">
            Best: {best.session} · {money(best.pnl)}
          </h3>
        </div>
        <Select defaultValue="net">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="net">NET P&L</SelectItem>
            <SelectItem value="gross">GROSS P&L</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="inline-flex rounded-full bg-muted p-1">
        {(["entry", "exit"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1 text-sm rounded-full capitalize transition-colors ${
              mode === m ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.session} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-sm text-muted-foreground">{r.session}</span>
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${r.pnl >= 0 ? "bg-primary" : "bg-destructive"}`}
                style={{ width: `${Math.max((Math.abs(r.pnl) / max) * 100, 2)}%` }}
              />
            </div>
            <span
              className={`w-20 text-right text-sm font-medium ${
                r.pnl >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {shortMoney(r.pnl)}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <th className="text-left font-medium px-3 py-2">Session</th>
              <th className="text-right font-medium px-3 py-2">Net P&L</th>
              <th className="text-right font-medium px-3 py-2">Win Rate (%)</th>
              <th className="text-right font-medium px-3 py-2">Trades</th>
              <th className="text-right font-medium px-3 py-2">Expectancy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.session} className="border-t border-border">
                <td className="px-3 py-2">{r.session}</td>
                <td
                  className={`px-3 py-2 text-right font-medium ${
                    r.pnl >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {money(r.pnl)}
                </td>
                <td className="px-3 py-2 text-right">
                  <LockedCell />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{r.trades}</td>
                <td className="px-3 py-2 text-right">
                  <LockedCell />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
