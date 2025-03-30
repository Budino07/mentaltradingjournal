
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { useAuth } from "./AuthContext";

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

    // Get all trades from journal entries
    const allTrades = analyticsData.journalEntries.flatMap(entry => 
      (entry.trades || []).map(trade => ({
        ...trade,
        entryDate: trade.entryDate || '',
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
    
    // Check if today's trades exceed average
    if (todayTrades.length > avgTradesPerDay && avgTradesPerDay > 0) {
      // Check if we've already notified about this today
      const alreadyNotified = notifications.some(notification => 
        notification.title === "Trading Frequency Alert" && 
        new Date(notification.createdAt).toISOString().split('T')[0] === today
      );

      if (!alreadyNotified) {
        addNotification({
          title: "Trading Frequency Alert",
          message: `You've made ${todayTrades.length} trades today, which exceeds your average of ${avgTradesPerDay} trades per day. Are you sticking to your trading plan?`,
          type: "warning"
        });
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
