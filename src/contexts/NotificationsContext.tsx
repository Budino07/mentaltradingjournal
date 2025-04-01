
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useAuth } from "./AuthContext";
import { startOfDay, isSameDay, differenceInHours, format, differenceInDays, isWithinInterval, subDays, endOfDay } from "date-fns";
import { JournalEntryType } from "@/types/journal";
import { getUserTimezone } from "@/utils/dateUtils";

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: "info" | "warning" | "success" | "error";
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  // Use React Query to fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
    enabled: !!user,
  });

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Add a new notification
  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper function to check if a notification was sent today with the given title
  const hasSentTodayWithTitle = (title: string) => {
    const today = startOfDay(new Date());
    return notifications.some(notification => 
      notification.title === title && 
      isSameDay(new Date(notification.createdAt), today)
    );
  };

  // Helper function to check if a notification was sent within the specified days with the given title
  const hasSentWithinDaysWithTitle = (title: string, days: number) => {
    const cutoffDate = subDays(new Date(), days);
    return notifications.some(notification => 
      notification.title === title && 
      new Date(notification.createdAt) >= cutoffDate
    );
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (!user) return;
    
    const savedNotifications = localStorage.getItem(`notifications-${user.id}`);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert string dates back to Date objects
        const notificationsWithDates = parsed.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error("Failed to parse saved notifications:", error);
      }
    }
  }, [user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`notifications-${user.id}`, JSON.stringify(notifications));
  }, [notifications, user]);

  // Check for overtrading and create notifications if needed
  useEffect(() => {
    if (!analyticsData || !user) return;

    // Get the user's timezone
    const userTimezone = getUserTimezone();

    // Get current time in user's timezone
    const now = new Date();
    const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
    const currentHour = userLocalTime.getHours();

    // Get all trades from journal entries
    const allTrades = analyticsData.journalEntries.flatMap(entry => 
      (entry.trades || []).map(trade => ({
        ...trade,
        entryDate: trade.entryDate || '',
        pnl: typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : (trade.pnl || 0),
        entry: entry,
      }))
    );

    // Get trades from today
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = allTrades.filter(trade => 
      trade.entryDate && trade.entryDate.startsWith(today)
    );

    // Calculate average trades per day
    const dayTradeMap = allTrades.reduce((acc, trade) => {
      if (!trade.entryDate) return acc;
      
      const day = trade.entryDate.split('T')[0];
      if (!acc[day]) acc[day] = 0;
      acc[day]++;
      return acc;
    }, {} as Record<string, number>);
    
    const days = Object.keys(dayTradeMap).length;
    const totalTrades = Object.values(dayTradeMap).reduce((sum, count) => sum + count, 0);
    
    const avgTradesPerDay = days > 0 ? Math.round(totalTrades / days) : 0;
    
    // Check if today's trades exceed average (Overtrading notification)
    if (todayTrades.length > avgTradesPerDay && avgTradesPerDay > 0) {
      // Check if we've already notified about this today
      const alreadyNotified = hasSentTodayWithTitle("Trading Frequency Alert");

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
        const alreadyNotified = hasSentWithinDaysWithTitle(streakTitle, 1);
        
        if (!alreadyNotified) {
          addNotification({
            title: streakTitle,
            message: `You've had ${lastThreeTrades.length} profitable trades in a row! Keep up the great work.`,
            type: "success"
          });
        }
      }
    }

    // Journal entries with emotions
    const entriesWithEmotions = analyticsData.journalEntries.filter(entry => 
      entry.emotion && (entry.session_type === 'pre' || entry.session_type === 'post')
    );

    // Check for consistent emotions and successful trades
    if (entriesWithEmotions.length > 5) {
      const recentEntries = entriesWithEmotions
        .slice(0, 5)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const consistentPositiveEmotions = recentEntries.filter(entry => 
        entry.emotion?.toLowerCase().includes('positive')
      ).length >= 3;
      
      const hasSuccessfulTrades = allTrades
        .filter(trade => trade.pnl > 0 && trade.entryDate && 
          new Date(trade.entryDate) >= subDays(new Date(), 7)
        ).length >= 2;
      
      if (consistentPositiveEmotions && hasSuccessfulTrades) {
        const emotionTitle = "You're in the zone! 🚀";
        if (!hasSentWithinDaysWithTitle(emotionTitle, 3)) {
          addNotification({
            title: emotionTitle,
            message: "Keep that mindset strong. Your positive emotions are correlated with successful trades!",
            type: "success"
          });
        }
      }
    }

    // Check for well-executed trades (based on followed rules)
    const wellExecutedEntries = analyticsData.journalEntries
      .filter(entry => entry.session_type === 'post' && entry.followed_rules && entry.followed_rules.length > 2)
      .slice(0, 5);
    
    if (wellExecutedEntries.length >= 3) {
      const momentumTitle = "Momentum is on your side!";
      if (!hasSentWithinDaysWithTitle(momentumTitle, 5)) {
        addNotification({
          title: momentumTitle,
          message: "Trust your system! You've been consistently following your trading rules.",
          type: "success"
        });
      }
    }

    // Milestone notification for journaling streak
    if (analyticsData?.dataRequirements?.journalStreak >= 10) {
      const milestoneTitle = "You've reached a new milestone! 🎉";
      if (!hasSentWithinDaysWithTitle(milestoneTitle, 10)) {
        addNotification({
          title: milestoneTitle,
          message: `You've maintained a ${analyticsData.dataRequirements.journalStreak}-day journaling streak! Your consistency is impressive.`,
          type: "success"
        });
      }
    }

    // 🧠 Mindset-Based Notifications - Check morning entries
    const todayEntries = analyticsData.journalEntries.filter(entry => 
      isSameDay(new Date(entry.created_at), new Date())
    );
    
    const morningEntry = todayEntries.find(entry => 
      entry.session_type === 'pre' && new Date(entry.created_at).getHours() < 12
    );
    
    if (morningEntry && morningEntry.emotion) {
      const mindsetTitle = `Your morning check-in: ${morningEntry.emotion}`;
      
      if (morningEntry.emotion.toLowerCase().includes('positive') && !hasSentTodayWithTitle(mindsetTitle)) {
        addNotification({
          title: mindsetTitle,
          message: "You're in a great headspace. Ready for some homerun trades! ⚡",
          type: "info"
        });
      } else if (morningEntry.emotion.toLowerCase().includes('neutral') && !hasSentTodayWithTitle(mindsetTitle)) {
        addNotification({
          title: mindsetTitle,
          message: "You're feeling neutral today. Stay disciplined and trust the process. 📈",
          type: "info"
        });
      } else if (morningEntry.emotion.toLowerCase().includes('negative') && !hasSentTodayWithTitle(mindsetTitle)) {
        addNotification({
          title: mindsetTitle,
          message: "A strong trader knows when to step back. Reset and refocus before jumping in. 🧘",
          type: "warning"
        });
      }
    }

    // ⏳ Reminders & Habit Tracking - Check if user hasn't journaled today (only after 5PM)
    // Using user's local time
    if (currentHour >= 17 && todayEntries.length === 0) {
      const reminderTitle = "Don't forget to journal today!";
      if (!hasSentTodayWithTitle(reminderTitle)) {
        addNotification({
          title: reminderTitle,
          message: "Small habits lead to big wins. Don't forget to log your trade insights today! ✅",
          type: "info"
        });
      }
    }

    // Post-session reminder - Check if user has pre-session but no post-session today as evening approaches
    const todayPreSessions = todayEntries.filter(entry => entry.session_type === 'pre');
    const todayPostSessions = todayEntries.filter(entry => entry.session_type === 'post');
    
    // If we have a pre-session but no post-session, and it's after 7 PM but before midnight in user's timezone
    if (todayPreSessions.length > 0 && todayPostSessions.length === 0 && currentHour >= 19 && currentHour < 24) {
      const postSessionReminderTitle = "Complete your trading day with a post-session";
      if (!hasSentTodayWithTitle(postSessionReminderTitle)) {
        addNotification({
          title: postSessionReminderTitle,
          message: "You logged your pre-session today, don't forget to complete your post-session analysis before the day ends! 📝",
          type: "warning"
        });
      }
    }

    // Journal streak notification
    if (analyticsData?.dataRequirements?.journalStreak === 7) {
      const streakTitle = "7-day streak in journaling! 📖";
      if (!hasSentWithinDaysWithTitle(streakTitle, 7)) {
        addNotification({
          title: streakTitle,
          message: "Your future self will thank you for this data. Keep it up!",
          type: "success"
        });
      }
    }

    // 📊 Data-Driven Insights - Best emotion for trading
    if (analyticsData?.emotionTrend && analyticsData.emotionTrend.length > 10) {
      // Find the emotion with the best average PnL
      const emotionPerformance = analyticsData.emotionTrend.reduce((acc, day) => {
        if (!day.emotion) return acc;
        
        if (!acc[day.emotion]) {
          acc[day.emotion] = { total: 0, count: 0 };
        }
        
        acc[day.emotion].total += day.pnl || 0;
        acc[day.emotion].count += 1;
        
        return acc;
      }, {} as Record<string, { total: number; count: number }>);
      
      // Calculate average PnL for each emotion
      const emotionAverages = Object.entries(emotionPerformance).map(([emotion, stats]) => ({
        emotion,
        avgPnl: stats.count > 0 ? stats.total / stats.count : 0
      }));
      
      // Find best performing emotion
      const bestEmotion = emotionAverages.reduce((best, current) => 
        current.avgPnl > best.avgPnl ? current : best, 
        { emotion: '', avgPnl: -Infinity }
      );
      
      if (bestEmotion.emotion && bestEmotion.avgPnl > 0) {
        const insightTitle = "Your best setups come when you feel...";
        if (!hasSentWithinDaysWithTitle(insightTitle, 14)) {
          addNotification({
            title: insightTitle,
            message: `Your best trades happen when you feel ${bestEmotion.emotion}. Keep that mental edge! 🏆`,
            type: "info"
          });
        }
      }
    }

    // Best time to trade insights - Group trades by hour and find the most profitable time period
    if (allTrades.length > 10) {
      const tradesByHour = allTrades.reduce((acc, trade) => {
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
        if (!hasSentWithinDaysWithTitle(timeInsightTitle, 14)) {
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

  }, [analyticsData]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
