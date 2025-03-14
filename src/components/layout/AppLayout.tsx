
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full flex-col md:flex-row bg-gradient-to-br from-primary-light/5 to-secondary-light/5">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <AppHeader />
          <main className="flex-1 p-3 md:p-6 overflow-y-auto overflow-x-hidden animate-fade-in pt-1 mt-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
