
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCcw,
  X,
} from "lucide-react";

interface AppSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const AppSidebar = ({ mobile, onClose }: AppSidebarProps) => {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (location.pathname.includes("journal")) return "journal";
    if (location.pathname.includes("notebook")) return "notebook";
    if (location.pathname.includes("analytics")) return "analytics";
    if (location.pathname.includes("backtesting")) return "backtesting";
    return "journal";
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "journal") navigate("/journal");
    if (value === "notebook") navigate("/notebook");
    if (value === "analytics") navigate("/analytics");
    if (value === "backtesting") navigate("/backtesting");
    
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`border-r border-border transition-all duration-300 ${
        mobile 
          ? "w-full h-full flex flex-col" 
          : open 
            ? "w-64" 
            : "w-[70px]"
      } bg-background/50 backdrop-blur-sm p-2 md:p-4`}
    >
      <div className="flex items-center justify-between h-12 mb-6">
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {!mobile && (
          <>
            <div className={`${open ? "block" : "hidden"}`}>
              <span className="font-bold text-xl">Trade Journal</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
              className="ml-auto"
            >
              {open ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </>
        )}
      </div>

      <Tabs
        orientation="vertical"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full flex-1"
      >
        <TabsList className="flex flex-col items-start justify-start gap-1 bg-transparent h-auto w-full">
          <SidebarItem
            icon={<Calendar className="h-5 w-5" />}
            label="Journal"
            value="journal"
            isExpanded={mobile || open}
            isActive={activeTab === "journal"}
          />
          <SidebarItem
            icon={<BookOpen className="h-5 w-5" />}
            label="Notebook"
            value="notebook"
            isExpanded={mobile || open}
            isActive={activeTab === "notebook"}
          />
          <SidebarItem
            icon={<BarChart2 className="h-5 w-5" />}
            label="Analytics"
            value="analytics"
            isExpanded={mobile || open}
            isActive={activeTab === "analytics"}
          />
          <SidebarItem
            icon={<RefreshCcw className="h-5 w-5" />}
            label="Backtesting"
            value="backtesting"
            isExpanded={mobile || open}
            isActive={activeTab === "backtesting"}
          />
        </TabsList>
      </Tabs>

      <div className="mt-auto">
        <SidebarItem
          icon={<ClipboardList className="h-5 w-5" />}
          label="Subscription"
          value="subscription"
          isExpanded={mobile || open}
          onClick={() => navigate("/pricing")}
        />
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isExpanded: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  label,
  value,
  isExpanded,
  isActive,
  onClick,
}: SidebarItemProps) => {
  if (onClick) {
    return (
      <Button
        onClick={onClick}
        variant="ghost"
        className={`w-full justify-start px-2 py-6 h-auto ${
          isActive ? "bg-muted" : ""
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {isExpanded && <span>{label}</span>}
        </span>
      </Button>
    );
  }

  return (
    <TabsTrigger
      value={value}
      className={`w-full justify-start px-2 py-6 h-auto ${
        isActive ? "data-[state=active]:bg-muted" : ""
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {isExpanded && <span>{label}</span>}
      </span>
    </TabsTrigger>
  );
};
