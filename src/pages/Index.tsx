
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { StatsHeader } from "@/components/journal/stats/StatsHeader";
import { WeeklyPerformance } from "@/components/journal/WeeklyPerformance";
import { TradesOverviewTable } from "@/components/journal/stats/TradesOverviewTable";
import { TimeFilterContextProvider } from "@/contexts/TimeFilterContext";

const Index = () => {
  return (
    <AppLayout>
      <TimeFilterContextProvider>
        <div className="container mx-auto py-6 space-y-8">
          <StatsHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyPerformance />
            <TradesOverviewTable />
          </div>
          
          <EmotionLogger />
        </div>
      </TimeFilterContextProvider>
    </AppLayout>
  );
};

export default Index;
