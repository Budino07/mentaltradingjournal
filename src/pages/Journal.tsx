import { AppLayout } from "@/components/layout/AppLayout";
import { SuccessCelebration } from "@/components/journal/SuccessCelebration";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { CalendarIcon, ChevronRight, ListFilter, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { JournalCalendarView } from "@/components/journal/JournalCalendarView";
import { Button } from "@/components/ui/button";
import { ProgressItem } from "@/components/journal/progress/ProgressItem";
import { EmptyState } from "@/components/ui/empty-state";
import { JournalFilters } from "@/components/journal/JournalFilters";
import { JournalStats } from "@/components/journal/JournalStats";

const Journal = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    sessionType: "all",
    emotion: "all",
    outcome: "all",
    dateRange: { from: undefined, to: undefined } as { from: Date | undefined; to: Date | undefined },
  });

  const { entries, isLoading, error } = useJournalEntries(user?.id);
  const { stats } = useProgressTracking();

  const filteredEntries = entries.filter((entry) => {
    // Filter by session type
    if (filterOptions.sessionType !== "all" && entry.session_type !== filterOptions.sessionType) {
      return false;
    }

    // Filter by emotion
    if (filterOptions.emotion !== "all" && entry.emotion !== filterOptions.emotion) {
      return false;
    }

    // Filter by outcome
    if (filterOptions.outcome !== "all" && entry.outcome !== filterOptions.outcome) {
      return false;
    }

    // Filter by date range
    if (filterOptions.dateRange.from && new Date(entry.created_at) < filterOptions.dateRange.from) {
      return false;
    }
    if (filterOptions.dateRange.to) {
      const toDateEnd = new Date(filterOptions.dateRange.to);
      toDateEnd.setHours(23, 59, 59, 999);
      if (new Date(entry.created_at) > toDateEnd) {
        return false;
      }
    }

    return true;
  });

  return (
    <AppLayout>
      <SuccessCelebration />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 gap-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Trading Journal</h1>
              <p className="text-muted-foreground">Track your trading journey and emotional patterns</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <ListFilter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button asChild size="sm">
                <Link to="/journal-entry">
                  New Entry
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-4">
              <h3 className="font-medium">Daily Progress</h3>
              <div className="space-y-3">
                <ProgressItem
                  icon={CalendarIcon}
                  title="Daily Activity"
                  value={stats.dailyStreak}
                  maxValue={30}
                  color="primary"
                  unit="days"
                />
              </div>
            </Card>
            <Card className="p-4 space-y-4">
              <h3 className="font-medium">Session Completion</h3>
              <div className="space-y-3">
                <ProgressItem
                  icon={CalendarIcon}
                  title="Pre-Session Streak"
                  value={stats.preSessionStreak}
                  maxValue={10}
                  color="secondary"
                  unit="sessions"
                />
                <ProgressItem
                  icon={CalendarIcon}
                  title="Post-Session Streak"
                  value={stats.postSessionStreak}
                  maxValue={10}
                  color="accent"
                  unit="sessions"
                />
              </div>
            </Card>
            <JournalStats entries={entries} />
          </div>

          {/* Filters */}
          {showFilters && (
            <JournalFilters
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
              entries={entries}
            />
          )}

          {/* Journal Entries */}
          <Tabs defaultValue="list" className="w-full" onValueChange={(value) => setView(value as "list" | "calendar")}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Journal Entries</h2>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <EmptyState
                  title="Error loading journal entries"
                  description="There was a problem loading your journal entries. Please try again."
                  icon={Loader2}
                />
              ) : filteredEntries.length === 0 ? (
                <EmptyState
                  title="No journal entries found"
                  description={
                    entries.length === 0
                      ? "Start tracking your trading journey by creating your first journal entry."
                      : "No entries match your current filters. Try adjusting your filter criteria."
                  }
                  action={
                    entries.length === 0 ? (
                      <Button asChild>
                        <Link to="/journal-entry">Create First Entry</Link>
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredEntries
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((entry) => (
                      <JournalEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <JournalCalendarView entries={filteredEntries} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Journal;
