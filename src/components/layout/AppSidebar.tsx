
import { Home, BookOpen, BarChart2, Settings, FlaskConical, Notebook, LineChart, List, Gift, Newspaper, Shield } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsAdmin } from "@/hooks/useAdmin";

function SidebarToggleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <polyline points="10 9 14 12 10 15" />
    </svg>
  );
}

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
  const { setOpenMobile, toggleSidebar, open } = useSidebar();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAdmin } = useIsAdmin();

  // Close mobile sidebar when navigating to a new page
  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <Sidebar className="hidden md:flex border-r border-primary/20" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={toggleSidebar}
                tooltip={open ? "Collapse sidebar" : "Expand sidebar"}
                className="transition-all duration-200"
              >
                <SidebarToggleIcon className="h-4 w-4" />
                <span>{open ? "Collapse" : "Expand"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith("/admin")}
                      tooltip="Admin"
                      className={cn(
                        "transition-all duration-200",
                        "data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
                        "data-[active=true]:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_0_16px_hsl(var(--primary)/0.25)]"
                      )}
                    >
                      <Link to="/admin" onClick={handleNavigation}>
                        <Shield className={cn("h-4 w-4", location.pathname.startsWith("/admin") && "text-primary")} />
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
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
