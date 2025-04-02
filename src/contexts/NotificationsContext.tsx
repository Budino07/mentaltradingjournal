
import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useAuth } from "./AuthContext";
import { getUserTimezone } from "@/utils/dateUtils";
import { NotificationsContextType, Notification } from "@/types/notifications";
import { useNotificationsStorage } from "@/hooks/useNotificationsStorage";
import { checkPerformanceNotifications } from "@/notifications/performanceNotifications";
import { checkEmotionNotifications } from "@/notifications/emotionNotifications";
import { checkJournalNotifications } from "@/notifications/journalNotifications";
import { useEffect } from "react";

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Use custom hook for notifications storage
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotificationsStorage(user?.id);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Use React Query to fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: generateAnalytics,
    enabled: !!user,
  });

  // Check for notifications that need to be created
  useEffect(() => {
    if (!analyticsData || !user) return;

    // Get the user's timezone and current hour
    const userTimezone = getUserTimezone();
    const now = new Date();
    const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
    const currentHour = userLocalTime.getHours();

    // Check for various types of notifications
    checkPerformanceNotifications(analyticsData, notifications, addNotification);
    checkEmotionNotifications(analyticsData, notifications, addNotification);
    checkJournalNotifications(analyticsData, notifications, addNotification, currentHour);
    
  }, [analyticsData, user, notifications, addNotification]);

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

export type { Notification };
