
export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: "info" | "warning" | "success" | "error";
};

export type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
};
