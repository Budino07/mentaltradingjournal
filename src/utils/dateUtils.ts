
import { differenceInDays, isWeekend } from 'date-fns';

export const shouldResetStreak = (lastActivity: Date): boolean => {
  const today = new Date();
  const daysSinceLastActivity = differenceInDays(today, lastActivity);
  
  // Check each day between last activity and today
  for (let i = 1; i <= daysSinceLastActivity; i++) {
    const checkDate = new Date(lastActivity);
    checkDate.setDate(checkDate.getDate() + i);
    
    // If we find a missed weekday, we should reset the streak
    if (!isWeekend(checkDate) && daysSinceLastActivity > 1) {
      return true;
    }
  }
  
  return false;
};

export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const parseInputDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    // Handle date-time string formats
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};
