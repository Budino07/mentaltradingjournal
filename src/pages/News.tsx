import { AppLayout } from "@/components/layout/AppLayout";
import { SessionClockCard } from "@/components/news/SessionClockCard";
import { SessionPerformanceCard } from "@/components/news/SessionPerformanceCard";
import { EconomicCalendarCard } from "@/components/news/EconomicCalendarCard";

export default function News() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-4 sm:py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">News</h1>
          <p className="text-sm text-muted-foreground">
            Live market sessions, session performance and the economic calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <SessionClockCard />
            <SessionPerformanceCard />
          </div>
          <EconomicCalendarCard />
        </div>
      </div>
    </AppLayout>
  );
}
