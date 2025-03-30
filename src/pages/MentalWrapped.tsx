
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WrappedInsights } from "@/components/wrapped/WrappedInsights";
import { WrappedSelector } from "@/components/wrapped/WrappedSelector";
import { useWrappedData } from "@/hooks/useWrappedData";
import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";

const MentalWrapped = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { isLoading, availableMonths, getMonthlyData } = useWrappedData();

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyData = selectedMonth ? getMonthlyData(selectedMonth) : null;

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">Mental Wrapped</h1>
          <p className="text-muted-foreground max-w-lg">
            Your personal trading journey recap. Discover insights about your performance and psychology each month.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 mt-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="w-full h-20 animate-pulse">
                <CardContent className="p-4 flex items-center justify-center">
                  <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : availableMonths.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Gift className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Wrapped Data Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Keep journaling your trades! Once you complete a month of trading, your Mental Wrapped will be available here.
            </p>
          </div>
        ) : (
          <>
            <WrappedSelector 
              availableMonths={availableMonths} 
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
            
            {monthlyData && (
              <WrappedInsights data={monthlyData} />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default MentalWrapped;
