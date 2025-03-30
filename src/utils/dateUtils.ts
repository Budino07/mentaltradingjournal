/**
 * Determines if the streak should be reset based on the last active date
 * @param lastActiveDate The date when the user was last active
 * @returns Boolean indicating if the streak should be reset
 */
export const shouldResetStreak = (lastActiveDate: Date): boolean => {
  const now = new Date();
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  
  return lastActiveDate < twoDaysAgo;
};
