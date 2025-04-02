
import { format, isSameDay, subDays } from "date-fns";
import { hasSentTodayWithTitle, hasSentWithinDaysWithTitle, getDaysSinceEmotion } from "@/utils/notificationUtils";
import { Notification } from "@/types/notifications";
import { JournalEntryType } from "@/types/journal";

export const checkEmotionNotifications = (
  analyticsData: any,
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
): void => {
  if (!analyticsData) return;

  // Get today's entries
  const entriesForToday = analyticsData.journalEntries.filter((entry: JournalEntryType) => 
    isSameDay(new Date(entry.created_at), new Date())
  );
  
  // Check if any of today's entries have each emotion
  const todayEmotions = entriesForToday.map(entry => entry.emotion);
  const hasPositiveToday = todayEmotions.includes('positive');
  const hasNeutralToday = todayEmotions.includes('neutral');
  const hasNegativeToday = todayEmotions.includes('negative');
  
  // Calculate days since each emotion was last logged
  const daysSincePositive = getDaysSinceEmotion('positive', analyticsData.journalEntries);
  const daysSinceNeutral = getDaysSinceEmotion('neutral', analyticsData.journalEntries);
  const daysSinceNegative = getDaysSinceEmotion('negative', analyticsData.journalEntries);
  
  // Positive emotion return notification
  if (hasPositiveToday && daysSincePositive >= 3) {
    const positiveReturnTitle = "Welcome back to positivity! 🎉";
    if (!hasSentTodayWithTitle(notifications, positiveReturnTitle)) {
      addNotification({
        title: positiveReturnTitle,
        message: `It's been ${daysSincePositive} days since you last felt positive. Great to see you back in a good headspace! Reflect on what changed to maintain this momentum.`,
        type: "success"
      });
    }
  }
  
  // Neutral emotion return notification
  if (hasNeutralToday && daysSinceNeutral >= 4) {
    const neutralReturnTitle = "Back to balance ⚖️";
    if (!hasSentTodayWithTitle(notifications, neutralReturnTitle)) {
      addNotification({
        title: neutralReturnTitle,
        message: `After ${daysSinceNeutral} days, you're back to a neutral emotional state. This balanced mindset can be great for objective decision making.`,
        type: "info"
      });
    }
  }
  
  // Negative emotion return notification
  if (hasNegativeToday && daysSinceNegative >= 5) {
    const negativeReturnTitle = "Emotional awareness check 🧠";
    if (!hasSentTodayWithTitle(notifications, negativeReturnTitle)) {
      addNotification({
        title: negativeReturnTitle,
        message: `You haven't recorded negative emotions in ${daysSinceNegative} days until today. Remember that acknowledging emotions is the first step to managing them. What triggered this change?`,
        type: "warning"
      });
    }
  }

  // 🧠 Mindset-Based Notifications - Check morning entries
  const morningEntry = entriesForToday.find(entry => 
    entry.session_type === 'pre' && new Date(entry.created_at).getHours() < 12
  );
  
  if (morningEntry && morningEntry.emotion) {
    const mindsetTitle = `Your morning check-in: ${morningEntry.emotion}`;
    
    if (morningEntry.emotion.toLowerCase().includes('positive') && !hasSentTodayWithTitle(notifications, mindsetTitle)) {
      addNotification({
        title: mindsetTitle,
        message: "You're in a great headspace. Ready for some homerun trades! ⚡",
        type: "info"
      });
    } else if (morningEntry.emotion.toLowerCase().includes('neutral') && !hasSentTodayWithTitle(notifications, mindsetTitle)) {
      addNotification({
        title: mindsetTitle,
        message: "You're feeling neutral today. Stay disciplined and trust the process. 📈",
        type: "info"
      });
    } else if (morningEntry.emotion.toLowerCase().includes('negative') && !hasSentTodayWithTitle(notifications, mindsetTitle)) {
      addNotification({
        title: mindsetTitle,
        message: "A strong trader knows when to step back. Reset and refocus before jumping in. 🧘",
        type: "warning"
      });
    }
  }

  // Journal entries with emotions
  const entriesWithEmotions = analyticsData.journalEntries.filter((entry: JournalEntryType) => 
    entry.emotion && (entry.session_type === 'pre' || entry.session_type === 'post')
  );

  // 📊 Data-Driven Insights - Best emotion for trading
  if (analyticsData?.emotionTrend && analyticsData.emotionTrend.length > 10) {
    // Find the emotion with the best average PnL
    const emotionPerformance = analyticsData.emotionTrend.reduce((acc: Record<string, { total: number; count: number }>, day: any) => {
      if (!day.emotion) return acc;
      
      if (!acc[day.emotion]) {
        acc[day.emotion] = { total: 0, count: 0 };
      }
      
      if (acc[day.emotion]) {
        acc[day.emotion].total += day.pnl || 0;
        acc[day.emotion].count += 1;
      }
      
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
      if (!hasSentWithinDaysWithTitle(notifications, insightTitle, 14)) {
        addNotification({
          title: insightTitle,
          message: `Your best trades happen when you feel ${bestEmotion.emotion}. Keep that mental edge! 🏆`,
          type: "info"
        });
      }
    }
  }
};
