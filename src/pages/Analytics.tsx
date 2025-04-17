
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { EmotionalJourneyChart } from "@/components/analytics/psychology/EmotionalJourneyChart";
import { PersonalityPatterns } from "@/components/analytics/PersonalityPatterns";
import { MentalScore } from "@/components/analytics/MentalScore";
import { EmotionTrend } from "@/components/analytics/EmotionTrend";
import { EmotionFrequency } from "@/components/analytics/EmotionFrequency";
import { MistakeAnalysis } from "@/components/analytics/MistakeAnalysis";
import { EmotionRecovery } from "@/components/analytics/EmotionRecovery";
import { OvertradingHeatMap } from "@/components/analytics/OvertradingHeatMap";
import { Card } from "@/components/ui/card";

export default function Analytics() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("psychology");

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
          <Card className="p-8 bg-card/10 backdrop-blur-xl border-primary/10 shadow-xl rounded-xl mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-center mb-4">
                <TabsList className="bg-background/50 backdrop-blur-sm">
                  <TabsTrigger value="psychology">Trader Psychology</TabsTrigger>
                  <TabsTrigger value="dashboard">Trading Analytics</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="psychology" className="w-full space-y-6 px-0 mx-0">
                <EmotionalJourneyChart />
                <div className="container mx-auto mt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <PersonalityPatterns />
                    <MentalScore />
                    <EmotionTrend />
                    <EmotionFrequency />
                    <MistakeAnalysis />
                    <EmotionRecovery />
                    <OvertradingHeatMap />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="dashboard" className="space-y-6 container mx-auto">
                <AnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </SubscriptionGuard>
    </AppLayout>
  );
};
