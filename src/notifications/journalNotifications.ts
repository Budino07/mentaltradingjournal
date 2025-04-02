
import { isSameDay } from "date-fns";
import { hasSentTodayWithTitle, hasSentWithinDaysWithTitle } from "@/utils/notificationUtils";
import { Notification } from "@/types/notifications";
import { JournalEntryType } from "@/types/journal";

export const checkJournalNotifications = (
  analyticsData: any,
  notifications: Notification[],
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void,
  currentHour: number
): void => {
  if (!analyticsData) return;

  // Get today's entries
  const entriesForToday = analyticsData.journalEntries.filter((entry: JournalEntryType) => 
    isSameDay(new Date(entry.created_at), new Date())
  );

  // Check for well-executed trades (based on followed rules)
  const wellExecutedEntries = analyticsData.journalEntries
    .filter((entry: JournalEntryType) => entry.session_type === 'post' && entry.followed_rules && entry.followed_rules.length > 2)
    .slice(0, 5);
  
  if (wellExecutedEntries.length >= 3) {
    const momentumTitle = "Momentum is on your side!";
    if (!hasSentWithinDaysWithTitle(notifications, momentumTitle, 5)) {
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
    if (!hasSentWithinDaysWithTitle(notifications, milestoneTitle, 10)) {
      addNotification({
        title: milestoneTitle,
        message: `You've maintained a ${analyticsData.dataRequirements.journalStreak}-day journaling streak! Your consistency is impressive.`,
        type: "success"
      });
    }
  }

  // ⏳ Reminders & Habit Tracking - Check if user hasn't journaled today (only after 5PM)
  // Using user's local time
  if (currentHour >= 17 && entriesForToday.length === 0) {
    const reminderTitle = "Don't forget to journal today!";
    if (!hasSentTodayWithTitle(notifications, reminderTitle)) {
      addNotification({
        title: reminderTitle,
        message: "Small habits lead to big wins. Don't forget to log your trade insights today! ✅",
        type: "info"
      });
    }
  }

  // Post-session reminder - Check if user has pre-session but no post-session today as evening approaches
  const todayPreSessions = entriesForToday.filter(entry => entry.session_type === 'pre');
  const todayPostSessions = entriesForToday.filter(entry => entry.session_type === 'post');
  
  // If we have a pre-session but no post-session, and it's after 7 PM but before midnight in user's timezone
  if (todayPreSessions.length > 0 && todayPostSessions.length === 0 && currentHour >= 19 && currentHour < 24) {
    const postSessionReminderTitle = "Complete your trading day with a post-session";
    if (!hasSentTodayWithTitle(notifications, postSessionReminderTitle)) {
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
    if (!hasSentWithinDaysWithTitle(notifications, streakTitle, 7)) {
      addNotification({
        title: streakTitle,
        message: "Your future self will thank you for this data. Keep it up!",
        type: "success"
      });
    }
  }
};
