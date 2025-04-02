
import { format, isSameDay, startOfDay, subDays } from "date-fns";
import { hasSentTodayWithTitle, hasSentWithinDaysWithTitle } from "@/utils/notificationUtils";
import { Notification } from "@/types/notifications";
import { getUserTimezone } from "@/utils/dateUtils";
import { JournalEntryType } from "@/types/journal";
import { Trade } from "@/types/trade";

export const checkPerformanceNotifications = (
  analyticsData: any,
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
): void => {
  if (!analyticsData) return;

  // Get all trades from journal entries
  const allTrades = analyticsData.journalEntries.flatMap((entry: JournalEntryType) =>
    (entry.trades || []).map((trade: Trade) => ({
      ...trade,
      entryDate: trade.entryDate || '',
      pnl: typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0),
      entry: entry,
    }))
  );

  // Calculate average trades per day
  const dayTradeMap = allTrades.reduce((acc: Record<string, number>, trade) => {
    if (!trade.entryDate) return acc;
    
    const day = trade.entryDate.split('T')[0];
    if (!acc[day]) acc[day] = 0;
    acc[day]++;
    return acc;
  }, {} as Record<string, number>);
  
  const days = Object.keys(dayTradeMap).length;
  const totalTrades = Object.values(dayTradeMap).reduce((sum, count) => sum + count, 0);
  
  const avgTradesPerDay = days > 0 ? Math.round(totalTrades / days) : 0;

  // Get trades from today
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = allTrades.filter(trade => 
    trade.entryDate && trade.entryDate.startsWith(today)
  );

  // Check if today's trades exceed average (Overtrading notification)
  if (todayTrades.length > avgTradesPerDay && avgTradesPerDay > 0) {
    // Check if we've already notified about this today
    const alreadyNotified = hasSentTodayWithTitle(notifications, "Trading Frequency Alert");

    if (!alreadyNotified) {
      addNotification({
        title: "Trading Frequency Alert",
        message: `You've made ${todayTrades.length} trades today, which exceeds your average of ${avgTradesPerDay} trades per day. Are you sticking to your trading plan?`,
        type: "warning"
      });
    }
  }
  
  // 🔥 Performance-Based Notifications - Winning streak (sent once per streak)
  if (allTrades.length >= 3) {
    const sortedTrades = [...allTrades].sort((a, b) => {
      const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0;
      const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0;
      return dateB - dateA; // Sort by date descending (newest first)
    });

    // Check for 3+ consecutive profitable trades
    const lastThreeTrades = sortedTrades.slice(0, 3);
    const allProfitable = lastThreeTrades.every(trade => trade.pnl > 0);
    
    if (allProfitable && lastThreeTrades.length === 3) {
      const streakTitle = "You're on fire! 🔥";
      // Only send once per streak
      const alreadyNotified = hasSentWithinDaysWithTitle(notifications, streakTitle, 1);
      
      if (!alreadyNotified) {
        addNotification({
          title: streakTitle,
          message: `You've had ${lastThreeTrades.length} profitable trades in a row! Keep up the great work.`,
          type: "success"
        });
      }
    }
  }

  // Best time to trade insights - Group trades by hour and find the most profitable time period
  if (allTrades.length > 10) {
    const userTimezone = getUserTimezone();
    
    const tradesByHour = allTrades.reduce((acc: Record<string, { total: number; profitable: number; count: number }>, trade) => {
      if (!trade.entryDate) return acc;
      
      // Convert the trade entry time to the user's timezone for accurate time analysis
      const entryDate = new Date(trade.entryDate);
      const userLocalTradeTime = new Date(entryDate.toLocaleString('en-US', { timeZone: userTimezone }));
      const hour = userLocalTradeTime.getHours();
      
      const hourRange = Math.floor(hour / 4) * 4; // Group in 4-hour blocks
      const hourRangeKey = `${hourRange}-${hourRange + 4}`;
      
      if (!acc[hourRangeKey]) {
        acc[hourRangeKey] = { total: 0, profitable: 0, count: 0 };
      }
      
      acc[hourRangeKey].total += trade.pnl;
      if (trade.pnl > 0) acc[hourRangeKey].profitable += 1;
      acc[hourRangeKey].count += 1;
      
      return acc;
    }, {} as Record<string, { total: number; profitable: number; count: number }>);
    
    // Calculate win rate and average PnL for each time period
    const timePerformance = Object.entries(tradesByHour).map(([time, stats]) => ({
      time,
      winRate: stats.count > 0 ? stats.profitable / stats.count : 0,
      avgPnl: stats.count > 0 ? stats.total / stats.count : 0,
      count: stats.count
    }));
    
    // Find the best performing time period with at least 5 trades
    const bestTime = timePerformance
      .filter(period => period.count >= 5)
      .reduce((best, current) => 
        current.avgPnl > best.avgPnl ? current : best, 
        { time: '', winRate: 0, avgPnl: -Infinity, count: 0 }
      );
    
    if (bestTime.time && bestTime.avgPnl > 0) {
      const timeInsightTitle = "Your best trading hours";
      if (!hasSentWithinDaysWithTitle(notifications, timeInsightTitle, 14)) {
        // Format hours in 12-hour format for better readability in the user's timezone
        const [startHour, endHour] = bestTime.time.split('-').map(Number);
        
        // Create a Date object in the user's timezone for formatting
        const userLocalStartTime = new Date();
        userLocalStartTime.setHours(startHour, 0, 0, 0);
        
        const userLocalEndTime = new Date();
        userLocalEndTime.setHours(endHour, 0, 0, 0);
        
        const formattedStartTime = format(userLocalStartTime, 'h:00 a');
        const formattedEndTime = format(userLocalEndTime, 'h:00 a');
        
        addNotification({
          title: timeInsightTitle,
          message: `Your win rate improves when you trade between ${formattedStartTime} and ${formattedEndTime}. Keep an eye on your best hours. ⏳`,
          type: "info"
        });
      }
    }
  }
};
