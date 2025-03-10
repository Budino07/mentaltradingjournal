
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";

const Index = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-3 space-y-4 max-w-full px-1 md:px-3">
        <EmotionLogger />
      </div>
    </AppLayout>
  );
};

export default Index;
