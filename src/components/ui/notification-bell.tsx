
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, Notification } from "@/contexts/NotificationsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const { toast } = useToast();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    clearAllNotifications
  } = useNotifications();

  // Mark all notifications as read when popover is opened
  useEffect(() => {
    if (open && unreadCount > 0 && !hasOpened) {
      markAllAsRead();
      setHasOpened(true);
    }
    
    if (!open) {
      setHasOpened(false);
    }
  }, [open, unreadCount, markAllAsRead, hasOpened]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Display a toast with the notification content for better visibility
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    });
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case "error":
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
      case "success":
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center">
                  <Badge 
                    className="h-5 w-5 rounded-full flex items-center justify-center p-0 bg-blue-500 border-0 text-white font-medium"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                </div>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent 
        className="w-[350px] p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className={cn(
          "max-h-[300px]",
          notifications.length === 0 && "h-[100px]"
        )}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-6 text-center">
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "py-2 px-3 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notification.read && "bg-muted/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), "h:mm a")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
