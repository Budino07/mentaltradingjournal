
import { AnalyticsInsight } from "@/types/analytics";
import { Notification } from "@/types/notifications";
import { hasSentTodayWithTitle, hasSentWithinDaysWithTitle } from "@/utils/notificationUtils";

// Check for performance-based notifications
export const checkPerformanceNotifications = (
  analytics: AnalyticsInsight,
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
) => {
  const { journalEntries } = analytics;
  
  // Skip if we don't have enough data
  if (journalEntries.length < 5) return;
  
  // Get entries from the last 30 days
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  const recentEntries = journalEntries.filter(
    entry => new Date(entry.created_at) >= lastMonth
  );
  
  // Skip if we don't have enough recent data
  if (recentEntries.length < 3) return;
  
  // Calculate recent performance metrics
  const recentTrades = recentEntries.flatMap(entry => entry.trades || []);
  
  // Skip if we don't have enough trades
  if (recentTrades.length < 5) return;
  
  // Calculate profits and losses
  let totalProfit = 0;
  let totalLoss = 0;
  let winCount = 0;
  let lossCount = 0;
  
  recentTrades.forEach(trade => {
    // Convert PnL to number if it's a string
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    if (pnl > 0) {
      totalProfit += pnl;
      winCount++;
    } else if (pnl < 0) {
      totalLoss += Math.abs(pnl);
      lossCount++;
    }
  });
  
  const totalPnL = totalProfit - totalLoss;
  const winRate = recentTrades.length > 0 ? (winCount / recentTrades.length) * 100 : 0;
  
  // Check for winning streak
  let currentStreak = 0;
  let maxStreak = 0;
  
  // Sort trades by date
  const sortedTrades = [...recentTrades].sort((a, b) => {
    const dateA = a.exitDate || a.entryDate || '0';
    const dateB = b.exitDate || b.entryDate || '0';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  // Check the current streak
  for (const trade of sortedTrades) {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    if (pnl > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Find the maximum streak
  let tempStreak = 0;
  const chronologicalTrades = [...sortedTrades].reverse();
  
  for (const trade of chronologicalTrades) {
    const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
               typeof trade.pnl === 'number' ? trade.pnl : 0;
    
    if (pnl > 0) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  // Notify on winning streaks
  if (currentStreak >= 3) {
    const streakTitle = `${currentStreak} trade winning streak!`;
    
    if (!hasSentTodayWithTitle(notifications, streakTitle)) {
      addNotification({
        title: streakTitle,
        message: `You're on a roll with ${currentStreak} profitable trades in a row. Keep following your trading plan!`,
        type: "success"
      });
    }
  }
  
  // Notify on new record streaks
  if (currentStreak > 0 && currentStreak === maxStreak && maxStreak >= 5) {
    const recordTitle = `New record: ${maxStreak} trade winning streak!`;
    
    if (!hasSentWithinDaysWithTitle(notifications, recordTitle, 30)) {
      addNotification({
        title: recordTitle,
        message: `Congratulations on your longest winning streak so far! This is a great time to review what you're doing right.`,
        type: "success"
      });
    }
  }
  
  // Notify on significant win rate improvements
  if (winRate > 50 && recentTrades.length >= 10) {
    // Get older entries for comparison
    const olderEntries = journalEntries.filter(
      entry => new Date(entry.created_at) < lastMonth
    );
    
    const olderTrades = olderEntries.flatMap(entry => entry.trades || []);
    
    if (olderTrades.length >= 10) {
      let olderWinCount = 0;
      
      olderTrades.forEach(trade => {
        const pnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                   typeof trade.pnl === 'number' ? trade.pnl : 0;
        if (pnl > 0) olderWinCount++;
      });
      
      const olderWinRate = (olderWinCount / olderTrades.length) * 100;
      
      // If win rate improved by at least 15 percentage points
      if (winRate >= olderWinRate + 15) {
        const improvementTitle = `Win rate improved by ${Math.round(winRate - olderWinRate)}%!`;
        
        if (!hasSentWithinDaysWithTitle(notifications, improvementTitle, 14)) {
          addNotification({
            title: improvementTitle,
            message: `Your win rate has improved from ${Math.round(olderWinRate)}% to ${Math.round(winRate)}%. Whatever changes you've made are working!`,
            type: "success"
          });
        }
      }
    }
  }
  
  // Notify on significant PnL milestones
  if (totalPnL > 0 && recentTrades.length >= 10) {
    const profitPercentage = (totalProfit / (totalProfit + totalLoss)) * 100;
    
    if (profitPercentage >= 70) {
      const profitTitle = `${Math.round(profitPercentage)}% of your recent trades are profitable!`;
      
      if (!hasSentWithinDaysWithTitle(notifications, profitTitle, 14)) {
        addNotification({
          title: profitTitle,
          message: `Your recent performance shows ${winCount} profitable trades out of ${recentTrades.length} total trades. Keep up the great work!`,
          type: "success"
        });
      }
    }
  }
};
