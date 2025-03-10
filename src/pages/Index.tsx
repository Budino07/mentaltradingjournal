
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <div className="container mx-auto py-4 space-y-6 max-w-full px-2 md:px-4">
        <EmotionLogger 
          onSubmitSuccess={() => navigate('/dashboard', { state: { showCelebration: true } })}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
