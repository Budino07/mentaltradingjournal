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

  useEffect(() => {
    const handleSearch = (event: CustomEvent) => {
      setSearchQuery(event.detail.query);
    };

    const handleDateSelect = (event: CustomEvent) => {
      // Clear the search query when a date is selected
      setSearchQuery("");
      setSelectedDate(event.detail.date);
      
      // Dispatch an event to notify other components that search should be cleared
      const clearSearchEvent = new CustomEvent('journal-search-clear');
      window.dispatchEvent(clearSearchEvent);
      
      setTimeout(() => {
        const journalEntriesSection = document.querySelector('#journal-entries');
        if (journalEntriesSection) {
          journalEntriesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    window.addEventListener('journal-search', handleSearch as EventListener);
    window.addEventListener('journal-date-select', handleDateSelect as EventListener);
    
    return () => {
      window.removeEventListener('journal-search', handleSearch as EventListener);
      window.removeEventListener('journal-date-select', handleDateSelect as EventListener);
    };
  }, [setSelectedDate]);

  const fetchEntries = async () => {
    if (!user) return;
    
    console.log('Fetching entries for user:', user.id);
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
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

    const channel = supabase
      .channel('journal_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setEntries(currentEntries => 
              currentEntries.map(entry => 
                entry.id === payload.new.id ? { ...entry, ...payload.new } : entry
              )
            );
          } else {
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
      setSearchQuery(""); // Clear search query when date is selected from location state
      
      setTimeout(() => {
        const journalEntriesSection = document.querySelector('#journal-entries');
        if (journalEntriesSection) {
          journalEntriesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [locationState?.selectedDate, setSelectedDate]);

  const searchFilteredEntries = (entries: JournalEntryType[]) => {
    if (!searchQuery) return entries;
    
    return entries.filter(entry => {
      if (entry.emotion.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      if (entry.emotion_detail.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      if (entry.notes.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      if (entry.outcome && entry.outcome.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      if (entry.market_conditions && entry.market_conditions.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      if (entry.followed_rules && entry.followed_rules.some(rule => 
        rule.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return true;
      }
      
      if (entry.mistakes && entry.mistakes.some(mistake => 
        mistake.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return true;
      }
      
      if (entry.post_submission_notes && 
        entry.post_submission_notes.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      if (entry.trades && entry.trades.length > 0) {
        return entry.trades.some(trade => {
          const tradeString = JSON.stringify(trade).toLowerCase();
          return tradeString.includes(searchQuery.toLowerCase());
        });
      }
      
      return false;
    });
  };

  let displayedEntries = selectedDate
    ? entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= startOfDay(selectedDate) && 
               entryDate <= endOfDay(selectedDate);
      })
    : filteredEntries;
  
  if (searchQuery) {
    displayedEntries = searchFilteredEntries(displayedEntries);
  }

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

            <JournalCalendar 
              date={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setSearchQuery(""); // Clear search query when a date is directly selected
                
                // Dispatch an event to notify other components that search should be cleared
                const clearSearchEvent = new CustomEvent('journal-search-clear');
                window.dispatchEvent(clearSearchEvent);
              }}
              entries={calendarEntries}
            />

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
