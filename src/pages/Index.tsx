
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <TimeFilterProvider>
      <AppLayout>
        <div className={`container mx-auto py-0 ${isMobile ? 'px-3' : 'px-2'}`}>
          <EmotionLogger />
        </div>
      </AppLayout>
    </TimeFilterProvider>
  );
};

export default Index;
