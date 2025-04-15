
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmotionalJourneyChart } from "@/components/analytics/psychology/EmotionalJourneyChart";

export default function Analytics() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <SubscriptionGuard>
        <div className="w-full max-w-none">
          <div className="space-y-6 container mx-auto">
            <EmotionalJourneyChart />
            <AnalyticsDashboard />
          </div>
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
}
