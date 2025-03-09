
import { AppLayout } from "@/components/layout/AppLayout";
import { EmotionLogger } from "@/components/journal/EmotionLogger";
import { TimeFilterProvider } from "@/contexts/TimeFilterContext";
import { useJournalFilters } from "@/hooks/useJournalFilters";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { JournalEntryType } from "@/types/journal";

const Index = () => {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setEntries(data || []);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <TimeFilterProvider>
      <AppLayout>
        <div className="container mx-auto py-6 space-y-8">
          <EmotionLogger />
        </div>
      </AppLayout>
    </TimeFilterProvider>
  );
};

export default Index;
