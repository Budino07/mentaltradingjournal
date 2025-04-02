
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
        <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4 sm:px-6'}`}>
          <AnalyticsDashboard />
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
}
