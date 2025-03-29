
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "../ui/toaster";
import { ScrollToTop } from "../ui/ScrollToTop";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="relative flex min-h-screen flex-col">
        <AppHeader />
        
        <div className="flex flex-1">
          {user && (
            <div className="sticky top-0 h-screen">
              <AppSidebar />
            </div>
          )}
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      
      <Toaster />
      <ScrollToTop />
    </div>
  );
};
