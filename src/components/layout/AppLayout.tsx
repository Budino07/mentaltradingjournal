
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className={`min-h-screen flex w-full flex-col md:flex-row bg-gradient-to-br from-primary-light/5 to-secondary-light/5 ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col w-full">
          <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className={`flex-1 p-2 md:p-4 overflow-auto ${isMobile ? 'h-[calc(100vh-56px)]' : ''} animate-fade-in`}>
            {children}
          </main>
        </div>
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {isMobile && (
          <div 
            className={`fixed top-0 bottom-0 left-0 w-64 bg-background z-50 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <AppSidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};
