
import { differenceInDays, isWeekend, format, isMonday, parseISO } from 'date-fns';

export const shouldResetStreak = (lastActivity: Date): boolean => {
  const today = new Date();
  const daysSinceLastActivity = differenceInDays(today, lastActivity);
  
  // If today is Monday and last activity was on Friday, don't reset streak
  if (isMonday(today) && daysSinceLastActivity <= 3 && isWeekend(new Date(lastActivity.getTime() + 24 * 60 * 60 * 1000))) {
    return false;
  }
  
  // Check each day between last activity and today
  for (let i = 1; i <= daysSinceLastActivity; i++) {
    const checkDate = new Date(lastActivity);
    checkDate.setDate(checkDate.getDate() + i);
    
    // Only consider missed weekday as streak breaker
    if (!isWeekend(checkDate) && i > 1) {
      // If we find any non-weekend day that was missed, reset the streak
      return true;
    }
  }
  
  return false;
};

// Add format function for date formatting
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

// Format date for display, like "May 15, 2023"
export const formatDisplayDate = (date: string | Date): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    console.error("Error formatting display date:", error);
    return '';
  }
};

// Format time, like "14:30"
export const formatTime = (date: string | Date): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
  } catch (error) {
    console.error("Error formatting time:", error);
    return '';
  }
};

// Get month name from date
export const getMonthName = (date: string | Date): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM yyyy');
  } catch (error) {
    console.error("Error getting month name:", error);
    return '';
  }
};

// Parse ISO string to Date object
export const parseISODate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error("Error parsing ISO date:", error);
    return new Date();
  }
};
