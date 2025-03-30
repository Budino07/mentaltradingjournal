
import { Home, BookOpen, BarChart2, Settings, UserCog, FlaskConical, BrainCircuit, Notebook, LineChart, List } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { title: "Journal Entry", icon: Home, url: "/journal-entry" },
  { title: "Dashboard", icon: BookOpen, url: "/dashboard" },
  { title: "Analytics", icon: BarChart2, url: "/analytics" },
  { title: "Trades List", icon: List, url: "/trades" },
  { title: "Backtesting", icon: FlaskConical, url: "/backtesting" },
  { title: "MFE & MAE Analysis", icon: LineChart, url: "/mfe-mae" },
  { title: "Notebook", icon: Notebook, url: "/notebook" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const [showMentorDialog, setShowMentorDialog] = useState(false);
  const { setOpenMobile } = useSidebar();
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
      <Sidebar className="w-14 flex-shrink-0 border-r border-primary/20 hidden md:flex fixed h-screen z-20" collapsible="none">
        <SidebarContent>
          <div className="p-3 flex justify-center">
            <Link to="/" className="flex items-center justify-center" onClick={handleNavigation}>
              <BrainCircuit className="w-5 h-5 text-primary transition-all duration-300 hover:text-accent" />
            </Link>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 py-1">
                <TooltipProvider>
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title} className="flex justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild className={`w-10 h-10 flex items-center justify-center ${isActive ? 'bg-primary/10' : ''}`}>
                              <Link 
                                to={item.url} 
                                className="flex items-center justify-center"
                                onClick={handleNavigation}
                              >
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-popover text-popover-foreground">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                  <SidebarMenuItem className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton className="w-10 h-10 flex items-center justify-center" onClick={() => setShowMentorDialog(true)}>
                          <UserCog className="w-4 h-4" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover text-popover-foreground">
                        Mentor Mode
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                </TooltipProvider>
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
