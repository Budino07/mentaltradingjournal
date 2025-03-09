
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntryType } from "@/types/journal";
import { Trade } from "@/types/trade";

interface TradeWithEntry {
  trade: Trade;
  entryId: string;
  entryDate: string;
}

export const useTradesOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [trades, setTrades] = useState<TradeWithEntry[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTrades([]);
          setIsLoading(false);
          return;
        }

        // Fetch journal entries that have trades
        const { data: entries, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching journal entries:", error);
          setTrades([]);
          setIsLoading(false);
          return;
        }

        // Process trades from all entries
        const allTrades: TradeWithEntry[] = [];
        entries?.forEach((entry: JournalEntryType) => {
          if (entry.trades && entry.trades.length > 0) {
            entry.trades.forEach((trade: Trade) => {
              allTrades.push({
                trade,
                entryId: entry.id,
                entryDate: entry.created_at,
              });
            });
          }
        });

        // Sort trades by date (newest first)
        const sortedTrades = allTrades.sort((a, b) => {
          const dateA = a.trade.entryDate || a.entryDate;
          const dateB = b.trade.entryDate || b.entryDate;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setTrades(sortedTrades);
      } catch (error) {
        console.error("Error in trades overview hook:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, []);

  return { trades, isLoading };
};
