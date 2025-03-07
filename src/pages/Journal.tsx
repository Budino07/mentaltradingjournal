
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JournalCalendar } from "@/components/journal/JournalCalendar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JournalEntry } from "@/components/journal/JournalEntry";
import { JournalFilters } from "@/components/journal/JournalFilters";
import { useJournalFilters } from "@/hooks/useJournalFilters";
import { JournalEntryType } from "@/types/journal";
import { StatsHeader } from "@/components/journal/stats/StatsHeader";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";
import { startOfDay, endOfDay } from "date-fns";
import { useLocation } from "react-router-dom";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const { user } = useAuth();
  const location = useLocation();
  const locationState = location.state as { selectedDate?: Date } | undefined;
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    selectedDate,
    setSelectedDate,
    filteredEntries
  } = useJournalFilters(entries);

  // Listen for search events from StatsHeader
  useEffect(() => {
    const handleSearch = (event: CustomEvent) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener('journal-search', handleSearch as EventListener);
    
    return () => {
      window.removeEventListener('journal-search', handleSearch as EventListener);
    };
  }, []);

  const fetchEntries = async () => {
    if (!user) return;
    
    console.log('Fetching entries for user:', user.id);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id) // Only fetch current user's entries
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journal entries:', error);
      return;
    }

    console.log('Fetched entries:', data);
    setEntries(data || []);
  };

  useEffect(() => {
    if (!user) return;

    fetchEntries();

    // Subscribe to real-time updates for current user's entries only
    const channel = supabase
      .channel('journal_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}` // Only listen to changes for current user's entries
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Immediately update the local state based on the change type
          if (payload.eventType === 'UPDATE') {
            setEntries(currentEntries => 
              currentEntries.map(entry => 
                entry.id === payload.new.id ? { ...entry, ...payload.new } : entry
              )
            );
          } else {
            // For other changes (INSERT, DELETE), fetch all entries again
            fetchEntries();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (locationState?.selectedDate) {
      setSelectedDate(new Date(locationState.selectedDate));
      
      // Scroll to journal entries section after a short delay to ensure the DOM is ready
      setTimeout(() => {
        const journalEntriesSection = document.querySelector('#journal-entries');
        if (journalEntriesSection) {
          journalEntriesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [locationState?.selectedDate, setSelectedDate]);

  // Filter entries based on the search query
  const searchFilteredEntries = (entries: JournalEntryType[]) => {
    if (!searchQuery) return entries;
    
    return entries.filter(entry => {
      // Search in emotion field
      if (entry.emotion.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search in emotion_detail field
      if (entry.emotion_detail.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search in notes field
      if (entry.notes.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search in outcome field
      if (entry.outcome && entry.outcome.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search in market_conditions field
      if (entry.market_conditions && entry.market_conditions.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search in followed_rules array
      if (entry.followed_rules && entry.followed_rules.some(rule => 
        rule.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return true;
      }
      
      // Search in mistakes array
      if (entry.mistakes && entry.mistakes.some(mistake => 
        mistake.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return true;
      }
      
      // Search in post_submission_notes
      if (entry.post_submission_notes && 
        entry.post_submission_notes.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search in trades - if they exist
      if (entry.trades && entry.trades.length > 0) {
        return entry.trades.some(trade => {
          // Convert trade fields to string to make searching easier
          const tradeString = JSON.stringify(trade).toLowerCase();
          return tradeString.includes(searchQuery.toLowerCase());
        });
      }
      
      return false;
    });
  };

  // Display all entries if no date is selected, otherwise filter by date
  let displayedEntries = selectedDate
    ? entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= startOfDay(selectedDate) && 
               entryDate <= endOfDay(selectedDate);
      })
    : filteredEntries;
  
  // Apply search filtering after date filtering
  if (searchQuery) {
    displayedEntries = searchFilteredEntries(displayedEntries);
  }

  // Map entries for calendar display
  const calendarEntries = entries.map(entry => ({
    date: new Date(entry.created_at),
    emotion: entry.emotion,
    trades: entry.trades || []
  }));

  return (
    <AppLayout>
      <SubscriptionGuard>
        <TimeFilterProvider>
          <div className="max-w-7xl mx-auto space-y-8 px-4">
            <StatsHeader />

            <div>
              <JournalCalendar 
                date={selectedDate}
                onDateSelect={setSelectedDate}
                entries={calendarEntries}
              />
            </div>

            <Card id="journal-entries" className="p-8 bg-card/30 backdrop-blur-xl border-primary/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                  {searchQuery 
                    ? `Search Results for "${searchQuery}"`
                    : selectedDate 
                      ? `Journal Entries for ${selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}`
                      : 'Journal Entries'
                  }
                </h2>
                <JournalFilters />
              </div>
              
              <ScrollArea className="h-[600px] pr-4">
                {displayedEntries.length > 0 ? (
                  <div className="space-y-4">
                    {displayedEntries.map((entry) => (
                      <JournalEntry key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {searchQuery
                      ? `No entries found for "${searchQuery}"`
                      : selectedDate 
                        ? `No entries found for ${selectedDate.toLocaleDateString()}`
                        : 'No entries found for the selected filters'
                    }
                  </p>
                )}
              </ScrollArea>
            </Card>
          </div>
        </TimeFilterProvider>
      </SubscriptionGuard>
    </AppLayout>
  );
};

export default Journal;
