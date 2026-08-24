
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full flex-col md:flex-row bg-gradient-to-br from-primary-light/5 to-secondary-light/5">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col w-full">
          <AppHeader />
          <main className={`flex-1 ${isMobile ? 'p-0 h-[calc(100vh-56px)]' : 'p-6'} overflow-auto animate-fade-in`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
