
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full flex-col md:flex-row bg-gradient-to-br from-primary-light/5 to-secondary-light/5">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden animate-fade-in">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};
