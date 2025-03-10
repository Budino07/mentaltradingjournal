
import { Home, BookOpen, BarChart2, Settings, UserCog, FlaskConical, BrainCircuit, Notebook, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
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

const menuItems = [
  { title: "Journal Entry", icon: Home, url: "/journal-entry" },
  { title: "Dashboard", icon: BookOpen, url: "/dashboard" },
  { title: "Analytics", icon: BarChart2, url: "/analytics" },
  { title: "Backtesting", icon: FlaskConical, url: "/backtesting" },
  { title: "MFE & MAE Analysis", icon: LineChart, url: "/mfe-mae" },
  { title: "Notebook", icon: Notebook, url: "/notebook" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const [showMentorDialog, setShowMentorDialog] = useState(false);

  return (
    <>
      <Sidebar className="w-14 flex-shrink-0" collapsible="none">
        <SidebarContent>
          <div className="p-3 flex justify-center">
            <Link to="/" className="flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-primary transition-all duration-300 hover:text-accent" />
            </Link>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <TooltipProvider>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link to={item.url} className="flex items-center justify-center">
                              <item.icon className="w-4 h-4" />
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover text-popover-foreground">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton onClick={() => setShowMentorDialog(true)}>
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
