
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { EmotionalJourneyChart } from "@/components/analytics/psychology/EmotionalJourneyChart";

export default function Analytics() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center mb-4">
              <TabsList className="bg-background/50 backdrop-blur-sm">
                <TabsTrigger value="dashboard">Trading Analytics</TabsTrigger>
                <TabsTrigger value="psychology">Trader Psychology</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="dashboard" className="space-y-6 container mx-auto">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="psychology" className="w-full space-y-6 px-0 mx-0">
              <EmotionalJourneyChart />
            </TabsContent>
          </Tabs>
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
}
