
import { createContext, useContext, useState, ReactNode } from "react";
import { TimeFilter } from "@/hooks/useJournalFilters";

interface TimeFilterContextType {
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
}

const TimeFilterContext = createContext<TimeFilterContextType | undefined>(undefined);

export function TimeFilterProvider({ children }: { children: ReactNode }) {
  // Changed the default value from null to "this-month"
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("this-month");

  return (
    <TimeFilterContext.Provider value={{ timeFilter, setTimeFilter }}>
      {children}
    </TimeFilterContext.Provider>
  );
}

export function useTimeFilter() {
  const context = useContext(TimeFilterContext);
  if (context === undefined) {
    throw new Error('useTimeFilter must be used within a TimeFilterProvider');
  }
  return context;
}
