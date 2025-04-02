
import { startOfDay, isSameDay, subDays, differenceInDays } from "date-fns";
import { JournalEntryType } from "@/types/journal";
import { Notification } from "@/types/notifications";

// Helper function to check if a notification was sent today with the given title
export const hasSentTodayWithTitle = (
  notifications: Notification[],
  title: string
): boolean => {
  const today = startOfDay(new Date());
  return notifications.some(
    (notification) =>
      notification.title === title &&
      isSameDay(new Date(notification.createdAt), today)
  );
};

// Helper function to check if a notification was sent within the specified days with the given title
export const hasSentWithinDaysWithTitle = (
  notifications: Notification[],
  title: string,
  days: number
): boolean => {
  const cutoffDate = subDays(new Date(), days);
  return notifications.some(
    (notification) =>
      notification.title === title &&
      new Date(notification.createdAt) >= cutoffDate
  );
};

// Helper function to find when an emotion was last logged
export const getDaysSinceEmotion = (
  emotion: string,
  entries: JournalEntryType[]
): number => {
  // Sort entries from newest to oldest
  const sortedEntries = [...entries].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Find most recent entry with this emotion (excluding today)
  const today = startOfDay(new Date());
  const mostRecentWithEmotion = sortedEntries.find(
    (entry) =>
      entry.emotion === emotion && !isSameDay(new Date(entry.created_at), today)
  );

  if (!mostRecentWithEmotion) {
    return 30; // Default to 30 days if never logged before
  }

  // Calculate days since that entry
  return differenceInDays(today, new Date(mostRecentWithEmotion.created_at));
};
