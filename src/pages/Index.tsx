
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";

const Index = () => {
  return (
    <TimeFilterProvider>
      <AppLayout>
        <div className="container mx-auto py-0 max-w-full px-0 sm:px-2">
          <EmotionLogger />
        </div>
      </AppLayout>
    </TimeFilterProvider>
  );
};

export default Index;
