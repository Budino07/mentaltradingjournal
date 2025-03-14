
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const AddJournalEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionType = location.state?.sessionType === 'post-session' ? 'post' : 'pre';
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3' : 'px-4'}`}>
        <EmotionLogger 
          initialSessionType={sessionType}
          onSubmitSuccess={() => {
            navigate("/dashboard");
          }}
        />
      </div>
    </AppLayout>
  );
};

export default AddJournalEntry;
