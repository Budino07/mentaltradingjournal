
import { AppLayout } from "@/components/layout/AppLayout";
import { NotebookContent } from "@/components/notebook/NotebookContent";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const Notebook = () => {
  return (
    <AppLayout>
      <SubscriptionGuard>
        <div className="h-[calc(100vh-4rem)] overflow-hidden">
          <NotebookContent />
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
};

export default Notebook;
