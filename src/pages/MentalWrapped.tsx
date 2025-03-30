
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MonthSelector } from "@/components/wrapped/MonthSelector";
import { InsightsDialog } from "@/components/wrapped/InsightsDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateMonthOptions } from "@/utils/dateUtils";
import { toast } from "@/hooks/use-toast";
import { getMonthlyInsights } from "@/utils/wrapped/insightsGenerator";
import { MonthlyInsights } from "@/types/wrapped";

const MentalWrapped = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([]);
  const [insightData, setInsightData] = useState<MonthlyInsights | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate available months based on journal entries
    const months = generateMonthOptions();
    setAvailableMonths(months);
  }, []);

  const handleMonthSelect = async (month: string) => {
    setIsLoading(true);
    setSelectedMonth(month);
    
    try {
      // Fetch insights for the selected month
      const insights = await getMonthlyInsights(month);
      setInsightData(insights);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching insights:", error);
      toast({
        title: "Could not load insights",
        description: "There was an error loading your monthly insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Mental Wrapped</CardTitle>
            <CardDescription>
              Explore your monthly trading journey with personalized insights and performance metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select a Month</h3>
              <p className="text-muted-foreground mb-4">
                Choose a completed month to see your personalized trading insights.
              </p>
              <MonthSelector 
                months={availableMonths} 
                onSelectMonth={handleMonthSelect} 
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Insights Dialog */}
        {insightData && (
          <InsightsDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            insights={insightData}
            month={selectedMonth || ""}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default MentalWrapped;
