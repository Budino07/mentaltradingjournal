import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDay } from "./calendar/CalendarDay";
import { CalendarNavigation } from "./calendar/CalendarNavigation";
import { Trade } from "@/types/trade";
import { WeeklyPerformance } from "./WeeklyPerformance";
import { CalendarModeToggle } from "./calendar/CalendarModeToggle";
import { CalendarModeProvider } from "@/contexts/CalendarModeContext";
import { useTimeFilter } from "@/contexts/TimeFilterContext";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface JournalCalendarProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  entries: Array<{
    date: Date;
    emotion: string;
    trades?: Trade[];
    session_type?: string;
  }>;
}

export const JournalCalendar = ({ date, onDateSelect, entries }: JournalCalendarProps) => {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState<Date>(date || new Date());
  const { setTimeFilter, setCustomDateRange } = useTimeFilter();

  // Update current month when calendar month changes
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    
    // Create a custom date range based on the selected month but don't set a custom filter label
    const monthKey = format(month, 'yyyy-MM');
    const isCurrentMonth = format(new Date(), 'yyyy-MM') === monthKey;
    
    // If it's the current month, use "this-month", otherwise create a custom filter
    if (isCurrentMonth) {
      setTimeFilter("this-month");
    } else {
      // Set custom date range without a visible label
      setCustomDateRange({
        start: startOfMonth(month),
        end: endOfMonth(month),
        label: '' // Empty label to avoid displaying the month name
      });
      setTimeFilter('custom');
    }
    
    console.log(`Month changed to: ${format(month, 'MMMM yyyy')}`);
  };

  // Subscribe to real-time updates
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
        async (payload) => {
          console.log('Real-time update received:', payload);
          // Immediately invalidate and refetch all relevant queries
          const queries = ['journal-entries', 'analytics', 'weekly-performance'];
          await Promise.all(
            queries.map(query => 
              queryClient.invalidateQueries({
                queryKey: [query],
                refetchType: 'active',
                exact: true
              })
            )
          );
          // Force an immediate refetch
          await Promise.all(
            queries.map(query => 
              queryClient.refetchQueries({
                queryKey: [query],
                type: 'active',
                exact: true
              })
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDateSelect = (newDate: Date | undefined) => {
    console.log('Date selected:', {
      _type: 'Date',
      value: {
        iso: newDate?.toISOString(),
        value: newDate?.getTime(),
        local: newDate?.toString()
      }
    });
    onDateSelect(newDate);
    
    // Dispatch an event to clear search when a date is selected from the calendar
    const clearSearchEvent = new CustomEvent('journal-search-clear');
    window.dispatchEvent(clearSearchEvent);
    
    const journalEntriesSection = document.querySelector('#journal-entries');
    if (journalEntriesSection) {
      journalEntriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigation = {
    IconLeft: CalendarNavigation().IconLeft,
    IconRight: CalendarNavigation().IconRight
  };

  return (
    <CalendarModeProvider>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        <TooltipProvider>
          <Card className="p-8 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
            <div className="flex justify-end mb-4">
              <CalendarModeToggle />
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              className="w-full"
              classNames={{
                months: "w-full space-y-4",
                month: "w-full space-y-4",
                table: "w-full border-collapse h-[calc(100vh-12rem)]",
                head_row: "flex w-full h-8",
                head_cell: "text-sm font-medium bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent w-[14.28%] text-center",
                row: "flex w-full h-24",
                cell: "w-[14.28%] p-1 relative [&:has([aria-selected])]:bg-accent/50 cursor-pointer",
                day: "h-full w-full transition-all duration-200 cursor-pointer group",
                day_today: "relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-primary-light before:to-accent before:opacity-10 before:transition-opacity hover:before:opacity-20 dark:before:opacity-20 dark:hover:before:opacity-30",
                day_selected: "border-primary-light border-2 shadow-lg shadow-primary-light/20 dark:border-primary-light dark:shadow-primary-light/20",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-2xl font-semibold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent",
                nav: "space-x-1 flex items-center",
                nav_button: "h-9 w-9 bg-transparent p-0 hover:opacity-100 hover:bg-primary hover:bg-opacity-10 rounded-full flex items-center justify-center transition-all duration-200",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
              }}
              components={{
                IconLeft: navigation.IconLeft,
                IconRight: navigation.IconRight,
                Day: ({ date: dayDate, ...props }) => (
                  <CalendarDay
                    date={dayDate}
                    entries={entries}
                    onSelect={handleDateSelect}
                    {...props}
                  />
                ),
              }}
            />
          </Card>
        </TooltipProvider>
        
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
          <WeeklyPerformance 
            entries={entries} 
            currentMonth={currentMonth} 
          />
        </Card>
      </div>
    </CalendarModeProvider>
  );
};
