
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full flex-col md:flex-row bg-[#0f1120] bg-gradient-to-br from-[#131529]/90 to-[#0f1120]">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col w-full md:ml-14"> {/* Added margin-left to accommodate fixed sidebar */}
          <AppHeader />
          <main className={`flex-1 ${isMobile ? 'p-0 h-[calc(100vh-56px)]' : 'p-6'} overflow-auto animate-fade-in`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
