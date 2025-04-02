
import { useState, useEffect } from "react";
import { Notification } from "@/types/notifications";

export const useNotificationsStorage = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (!userId) return;
    
    const savedNotifications = localStorage.getItem(`notifications-${userId}`);
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
  }, [userId]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(notifications));
  }, [notifications, userId]);

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

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
};
