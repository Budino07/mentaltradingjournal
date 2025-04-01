
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TimeFilterType = 'this-month' | 'last-month' | 'last-three-months' | 'last-year' | 'eternal' | 'custom';

type TimeFilterContextType = {
  timeFilter: TimeFilterType;
  setTimeFilter: React.Dispatch<React.SetStateAction<TimeFilterType>>;
  customDateRange: { start: Date | null; end: Date | null; label: string } | null;
  setCustomDateRange: React.Dispatch<React.SetStateAction<{ start: Date | null; end: Date | null; label: string } | null>>;
};

const TimeFilterContext = createContext<TimeFilterContextType | undefined>(undefined);

export const TimeFilterProvider = ({ children }: { children: ReactNode }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('this-month');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null; label: string } | null>(null);

  // Listen for custom time filter events from the calendar
  useEffect(() => {
    const handleCustomTimeFilter = (event: CustomEvent) => {
      const { start, end, label } = event.detail;
      
      console.log('Custom time filter received:', { start, end, label });
      
      setCustomDateRange({ start, end, label });
      setTimeFilter('custom');
    };

    window.addEventListener('custom-time-filter', handleCustomTimeFilter as EventListener);
    
    return () => {
      window.removeEventListener('custom-time-filter', handleCustomTimeFilter as EventListener);
    };
  }, []);

  return (
    <TimeFilterContext.Provider value={{ timeFilter, setTimeFilter, customDateRange, setCustomDateRange }}>
      {children}
    </TimeFilterContext.Provider>
  );
};

export const useTimeFilter = () => {
  const context = useContext(TimeFilterContext);
  if (context === undefined) {
    throw new Error('useTimeFilter must be used within a TimeFilterProvider');
  }
  return context;
};
