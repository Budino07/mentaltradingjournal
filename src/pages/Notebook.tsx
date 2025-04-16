
import { AppLayout } from "@/components/layout/AppLayout";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ThemeProvider } from "next-themes";

const Notebook = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppLayout>
        <SubscriptionGuard>
          <div className="h-[calc(100vh-4rem)] overflow-hidden">
            <NotebookContent />
          </div>
        </SubscriptionGuard>
      </AppLayout>
    </ThemeProvider>
  );
};

export default Notebook;
