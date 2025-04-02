
import { AnalyticsInsight, JournalEntry } from "@/types/analytics";
import { Notification } from "@/types/notifications";
import { hasSentTodayWithTitle, hasSentWithinDaysWithTitle, getDaysSinceEmotion } from "@/utils/notificationUtils";
import { differenceInDays } from "date-fns";

type EmotionState = 'positive' | 'neutral' | 'negative';

// Check for emotion return notifications (e.g., positive emotion after a period of absence)
export const checkEmotionReturnNotifications = (
  journalEntries: JournalEntry[],
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
) => {
  const entriesByDate = new Map<string, JournalEntry[]>();
  
  // Group entries by date
  journalEntries.forEach(entry => {
    const date = new Date(entry.created_at).toDateString();
    if (!entriesByDate.has(date)) {
      entriesByDate.set(date, []);
    }
    entriesByDate.get(date)!.push(entry);
  });

  // Get the most recent entry
  const sortedEntries = [...journalEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (sortedEntries.length === 0) return;
  
  const mostRecentEntry = sortedEntries[0];
  const mostRecentDate = new Date(mostRecentEntry.created_at).toDateString();
  const todayEntries = entriesByDate.get(mostRecentDate) || [];
  
  // Check for returns of positive emotions after 3+ days absence
  checkEmotionReturn(
    'positive', 
    3, 
    journalEntries, 
    todayEntries, 
    notifications, 
    addNotification,
    "Welcome back to positive emotions! It's been {days} days since you last logged feeling good.",
    "This is a great opportunity to reflect on what's changed. Try to maintain this positive momentum with consistent journaling."
  );
  
  // Check for returns of neutral emotions after 4+ days absence
  checkEmotionReturn(
    'neutral', 
    4, 
    journalEntries, 
    todayEntries, 
    notifications, 
    addNotification,
    "Balanced emotions detected! It's been {days} days since you last logged a neutral state.",
    "Emotional balance is key to trading success. Use this equilibrium to make more objective decisions."
  );
  
  // Check for returns of negative emotions after 5+ days absence
  checkEmotionReturn(
    'negative', 
    5, 
    journalEntries, 
    todayEntries, 
    notifications, 
    addNotification,
    "Noticed negative emotions today after {days} days. This is actually valuable data.",
    "Remember that tracking negative emotions is crucial for growth. Focus on how these feelings affect your trading decisions."
  );
};

// Helper function to check for the return of a specific emotion
const checkEmotionReturn = (
  emotion: EmotionState,
  minDays: number,
  allEntries: JournalEntry[],
  todayEntries: JournalEntry[],
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void,
  titleTemplate: string,
  messageTemplate: string
) => {
  // Check if the emotion was logged today
  const hasEmotionToday = todayEntries.some(entry => entry.emotion === emotion);
  
  if (!hasEmotionToday) return;
  
  // If the emotion is present today, check when it was last logged before today
  const previousEntries = [...allEntries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).filter(entry => {
    const entryDate = new Date(entry.created_at);
    const today = new Date();
    return entry.emotion === emotion && 
           entryDate.toDateString() !== today.toDateString();
  });
  
  if (previousEntries.length === 0) {
    // This is the first time logging this emotion
    const notificationTitle = `First time logging ${emotion} emotion!`;
    
    if (!hasSentTodayWithTitle(notifications, notificationTitle)) {
      addNotification({
        title: notificationTitle,
        message: `Tracking your ${emotion} emotions helps build a comprehensive view of your trading psychology.`,
        type: "info"
      });
    }
    return;
  }
  
  const lastEmotionEntry = previousEntries[0];
  const daysSinceEmotion = differenceInDays(
    new Date(),
    new Date(lastEmotionEntry.created_at)
  );
  
  if (daysSinceEmotion >= minDays) {
    const notificationTitle = titleTemplate.replace("{days}", daysSinceEmotion.toString());
    
    if (!hasSentTodayWithTitle(notifications, notificationTitle) && 
        !hasSentWithinDaysWithTitle(notifications, `${emotion} emotion return`, 7)) {
      addNotification({
        title: notificationTitle,
        message: messageTemplate,
        type: "info"
      });
    }
  }
};

// Check for emotion-based notifications
export const checkEmotionNotifications = (
  analytics: AnalyticsInsight,
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
) => {
  // Get entries from the last 30 days
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  
  const recentEntries = analytics.journalEntries.filter(
    entry => new Date(entry.created_at) >= lastMonth
  );
  
  if (recentEntries.length < 7) return; // Need at least a week of data
  
  // Check for emotion patterns
  const emotionCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  recentEntries.forEach(entry => {
    if (entry.emotion === 'positive') emotionCounts.positive++;
    else if (entry.emotion === 'neutral') emotionCounts.neutral++;
    else if (entry.emotion === 'negative') emotionCounts.negative++;
  });
  
  const totalEntries = recentEntries.length;
  
  // Check if any emotion is dominating (over 70%)
  const checkDominantEmotion = (
    emotion: EmotionState, 
    count: number, 
    total: number, 
    threshold: number = 0.7
  ) => {
    if (count / total >= threshold) {
      const notificationTitle = `${emotion} emotions dominating your journal`;
      
      if (!hasSentWithinDaysWithTitle(notifications, notificationTitle, 7)) {
        addNotification({
          title: notificationTitle,
          message: `${Math.round((count / total) * 100)}% of your recent entries have ${emotion} emotions. ${
            emotion === 'positive' 
              ? 'Great job maintaining a positive mindset!' 
              : emotion === 'neutral'
                ? 'Your emotional balance is impressive, but remember to acknowledge both positive and negative feelings.'
                : 'Consider strategies to improve your mindset, as negative emotions may impact your trading.'
          }`,
          type: emotion === 'negative' ? 'warning' : 'info'
        });
      }
    }
  };
  
  // Check for emotion returns after absence
  checkEmotionReturnNotifications(analytics.journalEntries, notifications, addNotification);
  
  checkDominantEmotion('positive', emotionCounts.positive, totalEntries);
  checkDominantEmotion('neutral', emotionCounts.neutral, totalEntries);
  checkDominantEmotion('negative', emotionCounts.negative, totalEntries, 0.5); // Lower threshold for negative
  
  // Check for emotion diversity
  const hasAllEmotions = emotionCounts.positive > 0 && emotionCounts.neutral > 0 && emotionCounts.negative > 0;
  
  if (hasAllEmotions && totalEntries >= 15) {
    const notificationTitle = 'Emotional awareness milestone';
    
    if (!hasSentWithinDaysWithTitle(notifications, notificationTitle, 30)) {
      addNotification({
        title: notificationTitle,
        message: 'You\'ve logged all three emotional states in your recent entries, showing strong emotional awareness. This helps you understand how different emotions affect your trading.',
        type: 'success'
      });
    }
  }
};
