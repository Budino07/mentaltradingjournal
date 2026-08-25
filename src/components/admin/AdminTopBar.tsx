import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange, Segment } from "@/hooks/useAdminAnalytics";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
} from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export function AdminTopBar({
  range,
  setRange,
  segment,
  setSegment,
}: {
  range: DateRange;
  setRange: (r: DateRange) => void;
  segment: Segment;
  setSegment: (s: Segment) => void;
}) {
  const today = new Date();

  const presets: { label: string; from: Date; to: Date }[] = [
    { label: "Today", from: today, to: today },
    { label: "Yesterday", from: subDays(today, 1), to: subDays(today, 1) },
    {
      label: "Last 7 Days",
      from: subDays(today, 6),
      to: today,
    },
    {
      label: "Previous month",
      from: startOfMonth(subMonths(today, 1)),
      to: endOfMonth(subMonths(today, 1)),
    },
    {
      label: "Previous 3 Months",
      from: startOfMonth(subMonths(today, 3)),
      to: endOfMonth(subMonths(today, 1)),
    },
    {
      label: "Previous Year",
      from: subDays(today, 365),
      to: today,
    },
    {
      label: "YTD",
      from: startOfYear(today),
      to: today,
    },
  ];

  return (
    <header className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 min-w-[180px]">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">
                {format(range.from, "MMM d")} - {format(range.to, "MMM d, yyyy")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col md:flex-row gap-3 p-3">
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {presets.map((p) => (
                  <Button
                    key={p.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setRange({ from: p.from, to: p.to })}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <CalendarComponent
                mode="range"
                selected={{ from: range.from, to: range.to }}
                onSelect={(v) => v?.from && v?.to && setRange({ from: v.from, to: v.to })}
                numberOfMonths={1}
              />
            </div>
          </PopoverContent>
        </Popover>
        <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ThemeToggle />
    </header>
  );
}
