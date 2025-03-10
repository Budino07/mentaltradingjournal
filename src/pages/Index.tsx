
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";

const Index = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-4 space-y-6 max-w-full px-2 md:px-4">
        <EmotionLogger />
      </div>
    </AppLayout>
  );
};

export default Index;
