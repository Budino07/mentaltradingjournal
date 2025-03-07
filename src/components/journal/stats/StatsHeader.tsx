import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { TradeWinPercentage } from "./TradeWinPercentage";
import { useTimeFilter } from "@/contexts/TimeFilterContext";
import { startOfMonth, subMonths, isWithinInterval, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSidebar } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { DollarSign, Smile, Flame, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/dateUtils";
import { JournalEntryType } from "@/types/journal";

export const StatsHeader = () => {
  const queryClient = useQueryClient();
  const { state, toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<JournalEntryType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const channel = supabase
      .channel('journal_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
  });

  const { stats } = useProgressTracking();
  const { timeFilter, setTimeFilter } = useTimeFilter();

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Search for entries when search query changes
  useEffect(() => {
    if (!searchQuery || !analytics?.journalEntries) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const foundEntries = analytics.journalEntries.filter(entry => {
      return (
        entry.emotion?.toLowerCase().includes(query) ||
        entry.emotion_detail?.toLowerCase().includes(query) ||
        entry.notes?.toLowerCase().includes(query) ||
        entry.outcome?.toLowerCase().includes(query) ||
        entry.market_conditions?.toLowerCase().includes(query) ||
        entry.followed_rules?.some(rule => rule.toLowerCase().includes(query)) ||
        entry.mistakes?.some(mistake => mistake.toLowerCase().includes(query)) ||
        entry.post_submission_notes?.toLowerCase().includes(query) ||
        (entry.trades && entry.trades.some(trade => 
          JSON.stringify(trade).toLowerCase().includes(query)
        ))
      );
    });

    // Sort entries by date (most recent first)
    const sortedEntries = [...foundEntries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Limit to 5 results for the dropdown
    setSearchResults(sortedEntries.slice(0, 5));
    
    // Still dispatch the search event for broader search
    const event = new CustomEvent('journal-search', { 
      detail: { query: searchQuery } 
    });
    window.dispatchEvent(event);
    
  }, [searchQuery, analytics?.journalEntries]);

  const handleEntryClick = (entry: JournalEntryType) => {
    // Create a new event to navigate to the selected date
    const selectedDate = new Date(entry.created_at);
    const event = new CustomEvent('journal-date-select', { 
      detail: { date: selectedDate } 
    });
    window.dispatchEvent(event);
    
    // Clear search
    setSearchResults([]);
  };

  const getTimeInterval = () => {
    const now = new Date();
    if (!timeFilter) {
      return null;
    }
    
    switch (timeFilter) {
      case "this-month":
        return {
          start: startOfMonth(now),
          end: now
        };
      case "last-month":
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case "last-three-months":
        return {
          start: startOfMonth(subMonths(now, 3)),
          end: now
        };
      case "last-year":
        return {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1))
        };
      default:
        return null;
    }
  };

  // Calculate Net P&L for the selected time period
  const calculateNetPnL = () => {
    if (!analytics?.journalEntries || analytics.journalEntries.length === 0) return 0;

    const interval = getTimeInterval();
    const filteredEntries = interval ? 
      analytics.journalEntries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return isWithinInterval(entryDate, interval);
      }) :
      analytics.journalEntries;

    if (filteredEntries.length === 0) return 0;

    return filteredEntries.reduce((total, entry) => {
      if (!entry.trades || entry.trades.length === 0) return total;
      
      return total + entry.trades.reduce((tradePnL, trade) => {
        const pnlValue = trade.pnl || 0;
        const numericPnL = typeof pnlValue === 'string' ? parseFloat(pnlValue) : pnlValue;
        return tradePnL + (isNaN(numericPnL) ? 0 : numericPnL);
      }, 0);
    }, 0);
  };

  const netPnL = calculateNetPnL();

  // Filter entries by time (for other components that need filtered data)
  const filteredEntries = analytics?.journalEntries ? 
    (getTimeInterval() ? 
      analytics.journalEntries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return isWithinInterval(entryDate, getTimeInterval()!);
      }) : 
      analytics.journalEntries) : 
    [];

  const emotionStats = filteredEntries.reduce((acc, entry) => {
    // Only count pre and post session entries for emotion stats
    if (entry.session_type === 'pre' || entry.session_type === 'post') {
      if (entry.emotion?.toLowerCase().includes('positive')) acc.positive++;
      acc.total++;
    }
    return acc;
  }, { positive: 0, total: 0 });

  const emotionScore = emotionStats.total === 0 ? 0 : 
    (emotionStats.positive / emotionStats.total) * 100;

  if (isAnalyticsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-start gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasEntries = analytics?.journalEntries && analytics.journalEntries.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-start gap-2 items-center flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hover:bg-primary/10"
          title={state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {state === "expanded" ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant={timeFilter === "this-month" ? "default" : "outline"}
          onClick={() => setTimeFilter("this-month")}
          disabled={!hasEntries}
        >
          Last 30 Days
        </Button>
        <Button 
          variant={timeFilter === "last-month" ? "default" : "outline"}
          onClick={() => setTimeFilter("last-month")}
          disabled={!hasEntries}
        >
          Last Month
        </Button>
        <Button 
          variant={timeFilter === "last-three-months" ? "default" : "outline"}
          onClick={() => setTimeFilter("last-three-months")}
          disabled={!hasEntries}
        >
          Last Quarter
        </Button>
        <Button 
          variant={timeFilter === "last-year" ? "default" : "outline"}
          onClick={() => setTimeFilter("last-year")}
          disabled={!hasEntries}
        >
          Last Year
        </Button>
        <Button 
          variant={timeFilter === "eternal" ? "default" : "outline"}
          onClick={() => setTimeFilter("eternal")}
          disabled={!hasEntries}
        >
          Eternal
        </Button>
        
        {/* Search functionality with dropdown */}
        <div className="relative ml-2">
          {isSearching ? (
            <div className="flex items-center border rounded-md bg-background">
              <Input
                type="text"
                placeholder="Search entries..."
                className="h-9 border-none focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearching(false);
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsSearching(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          )}
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && isSearching && (
            <div 
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-64 md:w-80 bg-popover rounded-md border shadow-md max-h-[300px] overflow-auto"
            >
              <div className="p-2 text-sm font-medium text-muted-foreground border-b">
                Search Results
              </div>
              <ul className="py-1">
                {searchResults.map((entry) => (
                  <li 
                    key={entry.id}
                    className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                    onClick={() => handleEntryClick(entry)}
                  >
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {entry.emotion} - {entry.emotion_detail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </div>
                      <div className="text-xs truncate max-w-full">
                        {entry.notes?.substring(0, 50)}{entry.notes?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Net P&L</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${hasEntries ? Math.abs(netPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className={`text-sm ${netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {hasEntries ? (netPnL >= 0 ? '▲ Profit' : '▼ Loss') : '-'}
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Emotion Meter</span>
            <Smile className="h-4 w-4 text-accent-dark" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {hasEntries ? emotionScore.toFixed(0) : '0'}%
          </div>
          <div className="text-sm text-muted-foreground">
            Positive Emotions
          </div>
        </Card>

        <TradeWinPercentage timeFilter={timeFilter} hasEntries={hasEntries} />

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Daily Streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.dailyStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            Days Active
          </div>
        </Card>
      </div>
    </div>
  );
};
