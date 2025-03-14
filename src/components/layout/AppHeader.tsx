
import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export const AppHeader = ({ onMenuToggle }: AppHeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="border-b border-border p-2 md:p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <span className="font-bold text-lg md:text-xl hidden md:block">Trade Journal</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};
