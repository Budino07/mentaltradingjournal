
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";

const Index = () => {
  return (
    <TimeFilterProvider>
      <AppLayout>
        <div className="container mx-auto py-0 space-y-4 max-w-full px-2 md:px-4">
          <EmotionLogger />
        </div>
      </AppLayout>
    </TimeFilterProvider>
  );
};

export default Index;
