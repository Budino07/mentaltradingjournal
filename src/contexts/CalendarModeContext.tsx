
import React, { createContext, useContext, useState, ReactNode } from 'react';

type CalendarMode = 'emotion' | 'performance';

interface CalendarModeContextType {
  mode: CalendarMode;
  toggleMode: () => void;
}

const CalendarModeContext = createContext<CalendarModeContextType | undefined>(undefined);

export function CalendarModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CalendarMode>('emotion');

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'emotion' ? 'performance' : 'emotion');
  };

  return (
    <CalendarModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </CalendarModeContext.Provider>
  );
}

export function useCalendarMode() {
  const context = useContext(CalendarModeContext);
  if (context === undefined) {
    throw new Error('useCalendarMode must be used within a CalendarModeProvider');
  }
  return context;
}
