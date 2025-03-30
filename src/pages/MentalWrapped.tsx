
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateAnalytics } from "@/utils/analyticsUtils";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { MonthSelector } from "@/components/wrapped/MonthSelector";
import { InsightsDialog } from "@/components/wrapped/InsightsDialog";
import { processMonthlyData } from "@/utils/wrapped/dataProcessing";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const MentalWrapped = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [monthlyInsights, setMonthlyInsights] = useState<Record<string, any>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: generateAnalytics,
  });

  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (!user) return;
      
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching journal entries:', error);
        return;
      }
      
      // Process entries to get available months
      const months: string[] = [];
      const processedData: Record<string, any> = {};
      
      if (entries && entries.length > 0) {
        entries.forEach(entry => {
          const date = new Date(entry.created_at);
          const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
          
          if (!months.includes(monthYear)) {
            months.push(monthYear);
          }
          
          // Group entries by month
          if (!processedData[monthYear]) {
            processedData[monthYear] = [];
          }
          
          processedData[monthYear].push(entry);
        });
        
        // Process data for each month
        Object.keys(processedData).forEach(month => {
          processedData[month] = processMonthlyData(processedData[month]);
        });
      }
      
      setAvailableMonths(months);
      setMonthlyInsights(processedData);
    };
    
    fetchJournalEntries();
  }, [user]);
  
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mental Wrapped</h1>
            <p className="text-muted-foreground">
              A monthly recap of your trading journey, psychology, and performance highlights
            </p>
          </div>
          
          <Separator />
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 h-48 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : availableMonths.length > 0 ? (
            <MonthSelector 
              months={availableMonths} 
              onSelectMonth={handleMonthSelect} 
            />
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-xl font-medium">No data available yet</h3>
              <p className="text-muted-foreground max-w-md">
                Start journaling your trades to see your Mental Wrapped insights at the end of the month.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = "/journal-entry"}>
                Create Journal Entry
              </Button>
            </Card>
          )}
        </motion.div>
      </div>
      
      {selectedMonth && (
        <InsightsDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          monthData={monthlyInsights[selectedMonth] || {}}
          monthName={selectedMonth}
        />
      )}
    </AppLayout>
  );
};

export default MentalWrapped;
