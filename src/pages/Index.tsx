
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";

const Index = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-8">
        <EmotionLogger />
      </div>
    </AppLayout>
  );
};

export default Index;
