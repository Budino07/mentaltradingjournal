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