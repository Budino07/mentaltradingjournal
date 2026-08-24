
import { Home, BookOpen, BarChart2, Settings, UserCog, FlaskConical, Notebook, LineChart, List, Gift, Newspaper, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { title: "Journal", icon: Home, url: "/journal-entry" },
  { title: "Dashboard", icon: BookOpen, url: "/dashboard" },
  { title: "Analytics", icon: BarChart2, url: "/analytics" },
  { title: "Trades", icon: List, url: "/trades" },
  { title: "Backtesting", icon: FlaskConical, url: "/backtesting" },
  { title: "MFE/MAE", icon: LineChart, url: "/mfe-mae" },
  { title: "News", icon: Newspaper, url: "/news" },
  { title: "Wrapped", icon: Gift, url: "/mental-wrapped" },
  { title: "Notebook", icon: Notebook, url: "/notebook" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const [showMentorDialog, setShowMentorDialog] = useState(false);
  const { setOpenMobile, toggleSidebar, open } = useSidebar();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close mobile sidebar when navigating to a new page
  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <Sidebar className="hidden md:flex border-r border-primary/20" collapsible="icon">
        <SidebarHeader className="p-2 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={toggleSidebar}
          >
            {open ? (
              <ChevronsLeft className="h-4 w-4" />
            ) : (
              <ChevronsRight className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 py-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200",
                          "data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
                          "data-[active=true]:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_0_16px_hsl(var(--primary)/0.25)]"
                        )}
                      >
                        <Link to={item.url} onClick={handleNavigation}>
                          <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowMentorDialog(true)}
                    tooltip="Mentor"
                    className="transition-all duration-200"
                  >
                    <UserCog className="h-4 w-4" />
                    <span>Mentor</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Dialog open={showMentorDialog} onOpenChange={setShowMentorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restricted Access</DialogTitle>
            <DialogDescription>
              Access to this feature is restricted. Only members of Tenacity Group are authorized to use it.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
