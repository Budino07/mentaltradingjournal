
import React, { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { getAvailableMonths, generateMonthlyInsights, WrappedMonth, WrappedInsight } from "@/utils/wrappedUtils";
import { MonthSelector } from "@/components/wrapped/MonthSelector";
import { InsightStory } from "@/components/wrapped/InsightStory";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const MentalWrapped = () => {
  const { user } = useAuth();
  const [availableMonths, setAvailableMonths] = useState<WrappedMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<WrappedMonth | null>(null);
  const [insights, setInsights] = useState<WrappedInsight[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: generateAnalytics,
  });

  useEffect(() => {
    if (analytics) {
      const months = getAvailableMonths(analytics.journalEntries);
      setAvailableMonths(months);
      
      // Default to the most recent month with data
      const recentMonthWithData = months.find(month => month.hasData);
      if (recentMonthWithData) {
        setSelectedMonth(recentMonthWithData);
      }
    }
  }, [analytics]);

  useEffect(() => {
    if (analytics && selectedMonth) {
      const monthIndex = new Date(Date.parse(`${selectedMonth.month} 1, ${selectedMonth.year}`)).getMonth();
      const insights = generateMonthlyInsights(
        analytics.journalEntries,
        monthIndex,
        selectedMonth.year
      );
      setInsights(insights);
      setDialogOpen(true);
    }
  }, [analytics, selectedMonth]);

  const handleMonthChange = (month: WrappedMonth) => {
    setSelectedMonth(month);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <SubscriptionGuard>
        <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Mental Wrapped
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your personal trading journey recap. Discover insights about your performance
              and psychology each month.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading your insights...</p>
            </div>
          ) : availableMonths.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-bold">No Data Available</h3>
              <p className="text-muted-foreground mt-2">
                Start using the journal to see your monthly insights.
              </p>
            </Card>
          ) : (
            <MonthSelector 
              months={availableMonths} 
              selectedMonth={selectedMonth} 
              onChange={handleMonthChange} 
            />
          )}
        </div>
        
        {/* Insight Story Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none">
            {selectedMonth && insights.length > 0 ? (
              <InsightStory 
                insights={insights}
                month={selectedMonth.month}
                year={selectedMonth.year}
                onClose={handleDialogClose}
              />
            ) : dialogOpen && (
              <Card className="p-8 text-center">
                <h3 className="text-xl font-bold">No Insights Available</h3>
                <p className="text-muted-foreground mt-2">
                  There's not enough data for the selected month.
                </p>
              </Card>
            )}
          </DialogContent>
        </Dialog>
      </SubscriptionGuard>
    </AppLayout>
  );
};

export default MentalWrapped;
